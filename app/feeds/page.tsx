import FeedView from '@/components/feed';
import { CompanyProvider } from '@/components/context/CompanyContext';

const Feeds = () => (
    <CompanyProvider>
        <FeedView />
    </CompanyProvider>
);

export default Feeds;