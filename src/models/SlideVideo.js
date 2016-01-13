import Base from './Base';

//MimeType: "application/vnd.nextthought.ntislidevideo"
export default class SlideVideo extends Base {

	constructor (service, parent, data) {
		delete data.creator;
		super(service, parent, data);

		/*

		DCDescription: null
		DCTitle: "Yahtzee Iteration 1"
		byline: "Deborah Trytten"

		slidedeckid: "tag:nextthought.com,2011-10:OU-NTISlideDeck-CS1323_SU_2015_Intro_to_Computer_Programming.nsd.pres:Yahtzee_1"
		thumbnail: "//www.kaltura.com/p/1500101/thumbnail/entry_id/0_xhui5jf0/width/640/"
		title: "Yahtzee Iteration 1"
		video-ntiid: "tag:nextthought.com,2011-10:OU-NTIVideo-CS1323_SU_2015_Intro_to_Computer_Programming.ntivideo.video_04.01.02_Yahtzee_1"
		*/
	}
}
