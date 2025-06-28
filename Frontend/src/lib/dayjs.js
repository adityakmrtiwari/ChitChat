import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

export default dayjs; 