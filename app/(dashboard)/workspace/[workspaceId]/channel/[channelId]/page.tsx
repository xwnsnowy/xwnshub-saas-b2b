import { ChannelHeader } from './_components/ChannelHeader';
import { MessagesList } from './_components/MessagesList';

const ChannelPageMain = () => {
  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Fixed Header */}
        <ChannelHeader />
        <div className="flex-1 overflow-y-auto mb-4">
          <MessagesList />
        </div>
      </div>

      {/* Scorll message area */}
    </div>
  );
};

export default ChannelPageMain;
