import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/Astron_LOGO.png" alt="Astron Pickleball Center" className={className} {...props} />;
}
