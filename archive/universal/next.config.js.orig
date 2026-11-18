/** @type {import('next').NextConfig} */
const nextConfig = {async headers(){return [{source:'/universal/sw.js',headers:[{key:'Service-Worker-Allowed',value:'/universal'},{key:'Cache-Control',value:'no-cache'}]}];}};

module.exports = nextConfig;
