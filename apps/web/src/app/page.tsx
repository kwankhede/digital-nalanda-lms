import { getHomeUpcoming } from "@/lib/api";
import Hero from "@/components/home/Hero";
import ImpactCounters from "@/components/home/ImpactCounters";
import EcosystemSection from "@/components/home/EcosystemSection";
import JourneyTimeline from "@/components/home/JourneyTimeline";
import SchoolsGrid from "@/components/home/SchoolsGrid";
import ValuesStrip from "@/components/home/ValuesStrip";
import UpcomingLiveClasses from "@/components/home/UpcomingLiveClasses";
import LatestAnnouncements from "@/components/home/LatestAnnouncements";
import JoinMission from "@/components/home/JoinMission";
import Newsletter from "@/components/home/Newsletter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Server-fetched live/event feed (handles empty gracefully). All other
  // sections self-fetch (client) with their own loading/error/empty states.
  const upcoming = await getHomeUpcoming();

  return (
    <div>
      <Hero />
      <ImpactCounters />
      <EcosystemSection />
      <JourneyTimeline />
      <SchoolsGrid />
      <ValuesStrip />

      {/* Live classes · announcements · join the mission */}
      <section id="events" className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <UpcomingLiveClasses items={upcoming} />
          <LatestAnnouncements />
          <JoinMission />
        </div>
      </section>

      <div id="newsletter">
        <Newsletter />
      </div>
    </div>
  );
}
