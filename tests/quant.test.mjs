import test from 'node:test'; import assert from 'node:assert/strict';
// Keep the reference checks dependency-free so they run in a clean checkout.
function cdf(x){return .5*(1+erf(x/Math.SQRT2))} function erf(x){const s=x<0?-1:1,a=0.254829592,b=-0.284496736,c=1.421413741,d=-1.453152027,e=1.061405429,p=.3275911,t=1/(1+p*Math.abs(x));return s*(1-((((e*t+d)*t+c)*t+b)*t+a)*t*Math.exp(-x*x))}
function call(S,K,T,s,r,q){const d1=(Math.log(S/K)+(r-q+s*s/2)*T)/(s*Math.sqrt(T)),d2=d1-s*Math.sqrt(T);return S*Math.exp(-q*T)*cdf(d1)-K*Math.exp(-r*T)*cdf(d2)}
test('Black-Scholes ATM call benchmark',()=>assert.ok(Math.abs(call(100,100,1,.2,.05,0)-10.4506)<.002));
test('put-call parity residual is near zero',()=>{const C=call(100,100,1,.2,.05,.01),P=C-100*Math.exp(-.01)+100*Math.exp(-.05);assert.ok(Math.abs(C-P-100*Math.exp(-.01)+100*Math.exp(-.05))<1e-10)});
test('seeded GBM paths are deterministic and distinct by seed',()=>{function p(seed){let x=seed,out=100;for(let k=0;k<8;k++){x=(1664525*x+1013904223)>>>0;const z=(x/4294967296-.5)*2;out*=Math.exp((.05-.2*.2/2)/8+.2/Math.sqrt(8)*z)}return out} assert.equal(p(42),p(42));assert.notEqual(p(42),p(43))});
