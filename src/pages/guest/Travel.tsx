/**
 * Everafter — Travel.
 *
 * Room blocks written up like stationery tickets, three ways to reach the
 * bay, and a one-line weather note. Scroll reveals are tuned per section:
 * the hotels stagger in as a row, the transport list rises as a block.
 */
import { HotelCard } from '../../components/guest/HotelCard'
import { GUEST_IMAGERY, unsplashUrl } from '../../components/guest/imagery'
import { useSectionReveal } from '../../lib/motion'
import { useWeddingStore } from '../../lib/store'
import '../../styles/guest-travel.css'

const HOTELS = [
  {
    name: 'AYANA Resort Bali',
    neighborhood: 'Jimbaran, Bali',
    distance: 'On the estate',
    code: 'TANLIM2027',
    rate: 'From $340/night',
    bookBy: '12 May 2027',
  },
  {
    name: 'InterContinental Bali Resort',
    neighborhood: 'Jimbaran Bay, Bali',
    distance: '10 min to AYANA',
    code: 'ALEXANDSAM',
    rate: 'From $210/night',
    bookBy: '12 May 2027',
  },
  {
    name: 'Renaissance Bali Uluwatu Resort & Spa',
    neighborhood: 'Uluwatu, Bali',
    distance: '20 min to AYANA',
    code: 'No block — book direct',
    rate: 'From $260/night',
    bookBy: 'Rooms are limited',
  },
]

export default function Travel() {
  const config = useWeddingStore((s) => s.config)

  const hotelsRef = useSectionReveal<HTMLUListElement>({
    selector: '.travel-hotel',
    y: 18,
    stagger: 0.08,
  })
  const transportRef = useSectionReveal<HTMLDivElement>({ y: 16 })
  const weatherRef = useSectionReveal<HTMLDivElement>({ y: 12 })

  return (
    <div>
      <div className="travel-hero">
        <img
          className="travel-hero__img"
          src={unsplashUrl(GUEST_IMAGERY.travel)}
          alt="Limestone cliffs dropping to a turquoise bay in Bali, palm trees and a curve of white sand below."
        />
        <div className="travel-hero__wash" aria-hidden="true" />
        <div className="travel-hero__content">
          <h1>Travel &amp; stay</h1>
        </div>
      </div>

      <div className="travel-page">
        <section>
          <div className="travel-section__head">
            <h2>Where to stay</h2>
            <p>
              A room block right on the estate, a second option a short ride along the bay in
              {' '}{config.city.split(',')[0]}, plus one further-out choice for anyone who wants a
              quieter base.
            </p>
          </div>
          <ul className="travel-hotels" ref={hotelsRef}>
            {HOTELS.map((hotel) => (
              <HotelCard key={hotel.name} {...hotel} />
            ))}
          </ul>
        </section>

        <section>
          <div className="travel-section__head">
            <h2>Getting there</h2>
            <p>AYANA Estate sits on the cliffs above Jimbaran, about 20 minutes from the airport.</p>
          </div>
          <div className="travel-transport" ref={transportRef}>
            <div className="travel-transport-item">
              <h3>By air</h3>
              <p>
                Fly into Ngurah Rai International (DPS) — most international routes connect through
                Singapore, Kuala Lumpur, Hong Kong or Jakarta. It is the closest airport to Jimbaran
                by far, so there is no reason to route through anywhere else.
              </p>
            </div>
            <div className="travel-transport-item">
              <h3>From the airport</h3>
              <p>
                The AYANA shuttle meets guests staying on the estate and takes about 20 minutes.
                Otherwise, Grab or Bluebird taxis are plentiful, metered, and easy to book from the
                arrivals hall.
              </p>
            </div>
            <div className="travel-transport-item">
              <h3>Getting around</h3>
              <p>
                A shuttle will run between the Jimbaran hotels and AYANA on Friday and Saturday. For
                everything else, Grab (ride-hailing) is the easiest way to move around the island —
                Bluebird's metered taxis are a reliable backup where Grab pickup is restricted.
              </p>
            </div>
          </div>
        </section>

        <section ref={weatherRef}>
          <div className="travel-weather">
            <h3>What June tends to do</h3>
            <p>
              June sits in Bali's dry season — expect sun most days, 27–31°C, with a breeze off the
              bay in the evenings. The ceremony and reception are both partly outdoors, so bring
              something light for later in the evening and sunscreen for earlier in the day.
            </p>
          </div>
          <div className="travel-weather">
            <h3>Passport &amp; visa</h3>
            <p>
              Indonesia offers visa-free or visa-on-arrival entry for most nationalities for stays
              under 30 days — check your passport's validity (six months beyond your travel dates is
              the usual rule) and your specific requirement before you book.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
