Add-Type -AssemblyName System.Drawing

function Resize-ImageCanvas {
    param (
        [string]$SourcePath,
        [string]$TargetPath,
        [int]$TargetWidth,
        [int]$TargetHeight
    )

    $srcImg = [System.Drawing.Image]::FromFile($SourcePath)
    
    $targetBmp = New-Object System.Drawing.Bitmap($TargetWidth, $TargetHeight, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 29, 31))
    $g.FillRectangle($brush, 0, 0, $TargetWidth, $TargetHeight)
    
    $scaleW = $TargetWidth / $srcImg.Width
    $scaleH = $TargetHeight / $srcImg.Height
    $scale = [Math]::Min($scaleW, $scaleH)
    
    $destW = [int]($srcImg.Width * $scale)
    $destH = [int]($srcImg.Height * $scale)
    $destX = [int](($TargetWidth - $destW) / 2)
    $destY = [int](($TargetHeight - $destH) / 2)
    
    $g.DrawImage($srcImg, $destX, $destY, $destW, $destH)
    
    $targetBmp.Save($TargetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $targetBmp.Dispose()
    $srcImg.Dispose()
    
    Write-Host "Created: $TargetPath ($TargetWidth x $TargetHeight)"
}

$imgModal = "C:\Users\onerock\.gemini\antigravity\brain\d1c4cba5-d852-433c-9881-eba9a3dddb1a\.user_uploaded\media_1787413861659.png"

# Generate 1280x800 Screenshot 3
Resize-ImageCanvas -SourcePath $imgModal -TargetPath "C:\Users\onerock\Downloads\screenshot-3-modal.png" -TargetWidth 1280 -TargetHeight 800
