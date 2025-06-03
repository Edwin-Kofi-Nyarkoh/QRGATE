//import Image from "next/image";

import Services from "@/components/services";
import Trending from "@/components/trendingEvents";
import VideoBackground from "@/components/videoBackground";

export default function Home() {
  return (
    <>
    <VideoBackground />
    <div className="my-12">
      < Trending/>
    </div>
    <Services />
    </>
  );
}
