import {writeFileSync,mkdirSync} from 'node:fs';
import {connect} from './browser_client.mjs';
const b=await connect(process.env.COURSE_DEBUG_URL),base=process.env.COURSE_TEST_BASE;
const report={checks:[],errors:[]};
function check(name,pass,details){report.checks.push({name,pass:!!pass,details});if(!pass)throw Error(name+': '+JSON.stringify(details));}
async function go(route,ready){await b.cdp('Page.navigate',{url:new URL(route,base).href});await b.waitFor(ready);await b.evaluate('window.MathJax?.startup?.promise');}
async function input(key,value){await b.evaluate(`(()=>{const e=document.querySelector('[data-count="${key}"]');e.value=${JSON.stringify(String(value))};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);}
async function snapshot(selector){return b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)});return {html:r.innerHTML,values:[...r.querySelectorAll('input,select')].map(e=>e.value)}})()`);}
async function stable(selector){const old=await snapshot(selector);await b.evaluate(`window.__nodes=[document.querySelector(${JSON.stringify(selector)}),...document.querySelector(${JSON.stringify(selector)}).querySelectorAll('*')]`);for(const mode of ['dark','light']){await b.theme(mode);check('theme preserves interactive DOM and results '+mode,JSON.stringify(old)===JSON.stringify(await snapshot(selector)));check('theme preserves node identities '+mode,await b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)});return [r,...r.querySelectorAll('*')].every((e,i)=>e===window.__nodes[i])})()`));}}
try {
 await b.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await go('fundamentos/evaluacion-clasificadores.html',"document.querySelector('[data-classifier-evaluation][data-initialized=\"true\"]')");
 const values=await b.evaluate("[...document.querySelectorAll('[data-metric]')].map(e=>e.textContent.trim())");
 check('initial confusion matrix metrics',JSON.stringify(values)===JSON.stringify(['78.3 %','75.0 %','66.7 %','70.6 %']),values);
 for(const k of ['tp','tn','fp','fn'])await input(k,0);
 check('zero denominators are undefined, never NaN',await b.evaluate("[...document.querySelectorAll('.ml-eval__metric')].every(e=>e.classList.contains('ml-eval__metric--undefined')) && !document.querySelector('[data-classifier-evaluation]').textContent.includes('NaN')"));
 await input('tp',10);await input('tn',10);
 check('perfect predictions',await b.evaluate("[...document.querySelectorAll('[data-metric]')].every(e=>e.textContent.trim()==='100.0 %')"));
 await input('fp',-4);check('negative count normalizes to zero',await b.evaluate("document.querySelector('[data-count=fp]').value==='0'"));
 await input('fn',2.6);check('fractional count normalizes to nearest integer',await b.evaluate("document.querySelector('[data-count=fn]').value==='3'"));
 await input('fn','');check('blank input restores last valid value',await b.evaluate("document.querySelector('[data-count=fn]').value==='3'"));
 await input('tp','1e30');check('large count bounded to safe integer',await b.evaluate("document.querySelector('[data-count=tp]').value===String(Number.MAX_SAFE_INTEGER)"));
 await stable('[data-classifier-evaluation]');
 await b.click('.ml-eval__reset');check('reset restores independent known counts',await b.evaluate("[...document.querySelectorAll('[data-count]')].map(e=>e.value).join(',')==='12,24,4,6'"));
 await go('fundamentos/ia-aprendizaje.html',"document.querySelectorAll('.ml-supervised__marker').length===2");
 await b.evaluate("document.querySelector('.ml-supervised__marker--classification').focus()");
 await b.key('ArrowLeft');
 check('classification operates by keyboard',await b.evaluate("document.querySelector('.ml-supervised__marker--classification').getAttribute('aria-label').includes('x uno 0.8')"));
 await b.evaluate("document.querySelector('.ml-supervised__marker--regression').focus()");await b.key('ArrowRight');
 const regression=await b.evaluate("document.querySelector('.ml-supervised__marker--regression').getAttribute('aria-valuenow')");
 check('regression keyboard moves x',Number(regression)>.75,regression);
 const prediction=Number(await b.evaluate("document.querySelector('[data-panel=regression] .ml-supervised__result-value').textContent.split('ŷ* = ')[1]"));
 const x=Number(regression);check('regression matches independently calculated curve',Math.abs(prediction-(.3*x+.95*Math.sin(1.12*x)))<.015,{x,prediction});
 await stable('[data-supervised-learning]');
 await b.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await b.evaluate("document.querySelector('[data-tab=classification]').focus()");await b.key('ArrowRight');
 check('mobile tabs operate by keyboard',await b.evaluate("document.querySelector('[data-supervised-learning]').dataset.activePanel==='regression' && document.activeElement.dataset.tab==='regression'"));
 await b.cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 const rect=await b.evaluate("(()=>{const r=document.querySelector('[data-tab=classification]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
 await b.cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[rect]});await b.cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 check('mobile tabs respond to touch',await b.evaluate("document.querySelector('[data-supervised-learning]').dataset.activePanel==='classification'"));
 const beforeTouch=await b.evaluate("document.querySelector('.ml-supervised__marker--classification').getAttribute('transform')");
 const drag=await b.evaluate("(()=>{const e=document.querySelector('.ml-supervised__marker--classification');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
 await b.cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[drag]});
 await b.cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:drag.x+25,y:drag.y-10}]});
 await b.cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 check('classification marker responds to touch drag',await b.evaluate("document.querySelector('.ml-supervised__marker--classification').getAttribute('transform')")!==beforeTouch);
 await stable('[data-supervised-learning]');
 check('no runtime/resource errors',b.errors.length===0,b.errors);
} catch(e){report.errors.push(e.message);process.exitCode=1;} finally {b.close();mkdirSync('artifacts/platform',{recursive:true});writeFileSync('artifacts/platform/course-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.length,failed:report.checks.filter(x=>!x.pass).length,errors:report.errors}));}
