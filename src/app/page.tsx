//import Image from "next/image";

import Trending from "@/components/trendingEvents";
import VideoBackground from "@/components/videoBackground";

export default function Home() {
  return (
    <>
    <VideoBackground />
    <div className="mt-14">
      < Trending/>
    </div>
    </>
  );
}
