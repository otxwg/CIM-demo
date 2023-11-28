define(["./defaultValue-f6d5e6da","./PixelFormat-81931fe6","./RuntimeError-9b4ce3fb","./createTaskProcessorWorker","./WebGLConstants-7f557f93"],(function(e,t,r,n,o){"use strict";
/**
     * @license
     *
     * Copyright (c) 2014, Brandon Jones. All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without modification,
     * are permitted provided that the following conditions are met:
     *
     *  * Redistributions of source code must retain the above copyright notice, this
     *  list of conditions and the following disclaimer.
     *  * Redistributions in binary form must reproduce the above copyright notice,
     *  this list of conditions and the following disclaimer in the documentation
     *  and/or other materials provided with the distribution.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
     * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
     * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
     * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
     * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
     * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
     * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
     * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
     * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */const f=1,i=2,s={};let a,u;s[0]=t.PixelFormat.RGB_DXT1,s[f]=t.PixelFormat.RGBA_DXT3,s[i]=t.PixelFormat.RGBA_DXT5;let c,l=0;function d(n,o){const f=n.data,i=f.byteLength,d=new Uint8Array(f),m=c._malloc(i);!function(e,t,r,n){let o;const f=r/4,i=n%4,s=new Uint32Array(e.buffer,0,(n-i)/4),a=new Uint32Array(t.buffer);for(o=0;o<s.length;o++)a[f+o]=s[o];for(o=n-i;o<n;o++)t[r+o]=e[o]}(d,c.HEAPU8,m,i);const _=c._crn_get_dxt_format(m,i),h=s[_];if(!e.defined(h))throw new r.RuntimeError("Unsupported compressed format.");const b=c._crn_get_levels(m,i),g=c._crn_get_width(m,i),w=c._crn_get_height(m,i);let p,y=0;for(p=0;p<b;++p)y+=t.PixelFormat.compressedTextureSizeInBytes(h,g>>p,w>>p);l<y&&(e.defined(a)&&c._free(a),a=c._malloc(y),u=new Uint8Array(c.HEAPU8.buffer,a,y),l=y),c._crn_decompress(m,i,a,y,0,b),c._free(m);if(e.defaultValue(n.bMipMap,!1)){const e=u.slice(0,y);return o.push(e.buffer),{format:h,width:g,height:w,buffer:e}}const A=t.PixelFormat.compressedTextureSizeInBytes(h,g,w),P=u.subarray(0,A),x=new Uint8Array(A);return x.set(P,0),o.push(x.buffer),{format:h,width:g,height:w,buffer:x}}function m(e){c=e,self.onmessage=n(d),self.postMessage(!0)}return function(t){const r=t.data.webAssemblyConfig;if(e.defined(r))return require([r.modulePath],(function(t){e.defined(r.wasmBinaryFile)?(e.defined(t)||(t=self.Module),m(t)):m(t)}))}}));
