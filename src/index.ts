// Ours
import { conf } from './config';
import { Companion } from './companion';
import { CasparCG } from './caspar';

const companion = new Companion();
const caspar = new CasparCG(conf.get('caspar_cg').host, conf.get('caspar_cg').port);
caspar.on('clips_changed', clips => {
	console.log(companion, clips);
	// Const pages = computePages(clips);
	// pages.forEach(page => {
	// 	companion.replacePage(page.number, page.data);
	// });
});
