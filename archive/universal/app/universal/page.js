import UniversalApp from './UniversalApp';
export const metadata={title:'Kidder’s Universal Day',description:'A little magic. A great next move.',robots:{index:false,follow:false},manifest:'/universal/manifest.webmanifest',appleWebApp:{capable:true,title:'Kidder Day',statusBarStyle:'default'},icons:{apple:'/universal/icon-192.png'}};
export const viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#071225'};
export default function Page(){return <UniversalApp/>;}
