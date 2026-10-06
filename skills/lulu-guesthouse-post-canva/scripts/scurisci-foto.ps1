<#
.SYNOPSIS
  Scurisce una foto per i post della Lùlù Guest House.
  Regolazioni (approssimazione delle cursori Lightroom):
    Luminosità -25, Alte luci -20, Bianchi -20.
  Rispetta l'orientamento EXIF, ridimensiona il lato lungo a 2400 px
  (solo se più grande) e lascia invariato il canale alfa.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scurisci-foto.ps1 -In foto.jpg -Out foto_scura.jpg
#>
param(
    [Parameter(Mandatory = $true)][string]$In,
    [Parameter(Mandatory = $true)][string]$Out,
    [int]$Luminosita = -25,
    [int]$AlteLuci = -20,
    [int]$Bianchi = -20,
    [int]$LatoLungo = 2400
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class LuluScurisci {
    static double Smooth(double a, double b, double x) {
        double t = Math.Max(0.0, Math.Min(1.0, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    public static byte[] Lut(int lum, int hi, int wh) {
        byte[] lut = new byte[256];
        for (int i = 0; i < 256; i++) {
            double x = i / 255.0;
            // Luminosità: scala dei toni (-25 -> circa -10% su tutta la gamma, più sui medi)
            double y = x * (1.0 + lum / 250.0);
            y = Math.Pow(y, 1.0 - lum / 400.0);
            // Alte luci: agisce sui toni sopra i medi
            y += (hi / 100.0) * 0.25 * Smooth(0.45, 0.85, y) * y;
            // Bianchi: agisce sul punto di bianco
            y += (wh / 100.0) * 0.20 * Smooth(0.75, 1.0, y);
            lut[i] = (byte)Math.Max(0, Math.Min(255, Math.Round(y * 255.0)));
        }
        return lut;
    }

    public static void Apply(Bitmap bmp, byte[] lut) {
        Rectangle r = new Rectangle(0, 0, bmp.Width, bmp.Height);
        BitmapData d = bmp.LockBits(r, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int n = Math.Abs(d.Stride) * bmp.Height;
        byte[] px = new byte[n];
        Marshal.Copy(d.Scan0, px, 0, n);
        for (int i = 0; i < n; i += 4) {   // B G R A: l'alfa (i+3) non si tocca
            px[i] = lut[px[i]];
            px[i + 1] = lut[px[i + 1]];
            px[i + 2] = lut[px[i + 2]];
        }
        Marshal.Copy(px, 0, d.Scan0, n);
        bmp.UnlockBits(d);
    }
}
"@

$inPath = (Resolve-Path $In).Path
$outPath = [System.IO.Path]::GetFullPath($Out)
$src = [System.Drawing.Image]::FromFile($inPath)

try {
    # Orientamento EXIF (tag 0x0112)
    if ($src.PropertyIdList -contains 0x0112) {
        $o = $src.GetPropertyItem(0x0112).Value[0]
        $rot = switch ($o) {
            2 { 'RotateNoneFlipX' } 3 { 'Rotate180FlipNone' } 4 { 'Rotate180FlipX' }
            5 { 'Rotate90FlipX' }   6 { 'Rotate90FlipNone' }  7 { 'Rotate270FlipX' }
            8 { 'Rotate270FlipNone' } default { $null }
        }
        if ($rot) { $src.RotateFlip([System.Drawing.RotateFlipType]::$rot) }
    }

    # Ridimensionamento del lato lungo
    $scala = [Math]::Min(1.0, $LatoLungo / [Math]::Max($src.Width, $src.Height))
    $w = [int][Math]::Round($src.Width * $scala)
    $h = [int][Math]::Round($src.Height * $scala)

    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $g.DrawImage($src, 0, 0, $w, $h)
    $g.Dispose()
}
finally { $src.Dispose() }

[LuluScurisci]::Apply($bmp, [LuluScurisci]::Lut($Luminosita, $AlteLuci, $Bianchi))

$ext = [System.IO.Path]::GetExtension($outPath).ToLower()
if ($ext -eq '.png') {
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
} else {
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $p = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]92)
    $bmp.Save($outPath, $enc, $p)
}
$bmp.Dispose()
Write-Output "Salvata: $outPath ($w x $h) - Luminosita $Luminosita, Alte luci $AlteLuci, Bianchi $Bianchi"
