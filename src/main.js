import './pulse.css';
import './refinement.css';
import {mountPulse} from './pulse.js';
const unmount=mountPulse(document.querySelector('#app'));
addEventListener('pagehide',event=>{if(!event.persisted)unmount();});
