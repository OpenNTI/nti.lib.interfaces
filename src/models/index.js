import Registry, {COMMON_PREFIX} from './Registry';
//
import './annotations';
import './anchors';
import './assessment';
import './chat';
import './content';
import './courses';
import './forums';
import './profile';
import './store';
//
import './Change';
import './User';
import './Community';
import './FriendsList';
import './DynamicFriendsList';
import './PageInfo';
import './SharingPagePreference';
import './Badge';
import './BadgeIssuer';
import './SuggestedContacts';
//Slides
import './Slide';
import './SlideVideo';
import './SlideDeck';
import './DiscussionReference';
import './RelatedWorkReference';
import './RelatedWorkReferencePointer';
import './Timeline';
//
import './MediaSource';
import './Video';
import './VideoRef';
import './Progress';

Registry.ignore('link');

export {
	Registry,
	COMMON_PREFIX
};
