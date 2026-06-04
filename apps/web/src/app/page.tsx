import { getHomeUpcoming, getHomeRecordings } from "@/lib/api";
import Hero from "@/components/home/Hero";
import NoticeTicker from "@/components/home/NoticeTicker";
import ImpactCounters from "@/components/home/ImpactCounters";
import EcosystemSection from "@/components/home/EcosystemSection";
import JourneyTimeline from "@/components/home/JourneyTimeline";
import SchoolsGrid from "@/components/home/SchoolsGrid";
import ValuesStrip from "@/components/home/ValuesStrip";
import Educators from "@/components/home/Educators";
import SuccessStories from "@/components/home/SuccessStories";
import RecordingsCarousel from "@/components/home/RecordingsCarousel";
import UpcomingLiveClasses from "@/components/home/UpcomingLiveClasses";
import LatestAnnouncements from "@/components/home/LatestAnnouncements";
import JoinMission from "@/components/home/JoinMission";
import ContactHelp from "@/components/home/ContactHelp";
import Newsletter from "@/components/home/Newsletter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [upcoming, recordings] = await Promise.all([
    getHomeUpcoming(),
    getHomeRecordings(),
  ]);

  return (
    <div>
      <Hero />
      <NoticeTicker />
      <ImpactCounters />

      {/* Live classes · announcements · join the mission */}
      <section id="events" className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <UpcomingLiveClasses items={upcoming} />
          <LatestAnnouncements />
          <JoinMission />
        </div>
      </section>

      {/* Schools → journey → ecosystem → values */}
      <SchoolsGrid />
      <JourneyTimeline />
      <EcosystemSection />
      <ValuesStrip />

      {/* People & proof: educators → success stories → recordings */}
      <Educators />
      <SuccessStories />
      <RecordingsCarousel recordings={recordings} />

      <ContactHelp />

      <div id="newsletter">
        <Newsletter />
      </div>
    </div>
  );
}
