"""Seed script: python -m app.seed (run from backend/)"""
from datetime import datetime, timedelta

from app.database import SessionLocal, engine, Base
from app.models.artist import Artist
from app.models.concert import Concert

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()

    if db.query(Artist).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    artists_data = [
        {"name": "Taylor Swift", "image_url": "https://placehold.co/300x300?text=Taylor+Swift", "genres": ["Pop", "Country"]},
        {"name": "BTS", "image_url": "https://placehold.co/300x300?text=BTS", "genres": ["K-Pop", "Hip-Hop"]},
        {"name": "Adele", "image_url": "https://placehold.co/300x300?text=Adele", "genres": ["Pop", "Soul"]},
        {"name": "Coldplay", "image_url": "https://placehold.co/300x300?text=Coldplay", "genres": ["Rock", "Alternative"]},
        {"name": "BLACKPINK", "image_url": "https://placehold.co/300x300?text=BLACKPINK", "genres": ["K-Pop", "Dance"]},
        {"name": "Ed Sheeran", "image_url": "https://placehold.co/300x300?text=Ed+Sheeran", "genres": ["Pop", "Folk"]},
        {"name": "The Weeknd", "image_url": "https://placehold.co/300x300?text=The+Weeknd", "genres": ["R&B", "Pop"]},
        {"name": "TWICE", "image_url": "https://placehold.co/300x300?text=TWICE", "genres": ["K-Pop", "Dance"]},
        {"name": "Yorushika", "image_url": "https://placehold.co/300x300?text=Yorushika", "genres": ["J-Rock", "Alternative"]},
        {"name": "Kenshi Yonezu", "image_url": "https://placehold.co/300x300?text=Kenshi+Yonezu", "genres": ["J-Pop", "Rock"]},
    ]

    artists = []
    for data in artists_data:
        artist = Artist(**data)
        db.add(artist)
        artists.append(artist)
    db.commit()
    for a in artists:
        db.refresh(a)

    now = datetime.utcnow()
    concerts_data = [
        # Taylor Swift
        {"artist": artists[0], "title": "The Eras Tour - Tokyo", "days": 30, "location": "Tokyo, Japan", "venue": "Tokyo Dome", "price_range": "$150-$450", "platform": "Ticketmaster", "organizer": "Live Nation", "status": "on_sale"},
        {"artist": artists[0], "title": "The Eras Tour - Seoul", "days": 45, "location": "Seoul, Korea", "venue": "Olympic Stadium", "price_range": "$120-$400", "platform": "Ticketmaster", "organizer": "Live Nation", "status": "upcoming"},
        {"artist": artists[0], "title": "The Eras Tour - Taipei", "days": 60, "location": "Taipei, Taiwan", "venue": "Taipei Arena", "price_range": "$100-$350", "platform": "Kktix", "organizer": "Live Nation", "status": "upcoming"},
        # BTS
        {"artist": artists[1], "title": "BTS World Tour - Osaka", "days": 20, "location": "Osaka, Japan", "venue": "Kyocera Dome", "price_range": "$100-$300", "platform": "Ticketmaster", "organizer": "HYBE", "status": "lottery_open"},
        {"artist": artists[1], "title": "BTS World Tour - Seoul", "days": 50, "location": "Seoul, Korea", "venue": "KSPO Dome", "price_range": "$80-$250", "platform": "Ticketmaster", "organizer": "HYBE", "status": "upcoming"},
        {"artist": artists[1], "title": "BTS Fan Meeting - Tokyo", "days": 75, "location": "Tokyo, Japan", "venue": "Yokohama Arena", "price_range": "$60-$150", "platform": "Peatix", "organizer": "HYBE", "status": "upcoming"},
        # Adele
        {"artist": artists[2], "title": "Weekends with Adele - Las Vegas", "days": 15, "location": "Las Vegas, USA", "venue": "The Colosseum", "price_range": "$200-$600", "platform": "Ticketmaster", "organizer": "AEG", "status": "on_sale"},
        {"artist": artists[2], "title": "Adele Live - London", "days": 90, "location": "London, UK", "venue": "Hyde Park", "price_range": "$150-$500", "platform": "Ticketmaster", "organizer": "AEG", "status": "upcoming"},
        # Coldplay
        {"artist": artists[3], "title": "Music of the Spheres - Tokyo", "days": 25, "location": "Tokyo, Japan", "venue": "National Stadium", "price_range": "$80-$250", "platform": "Ticketmaster", "organizer": "Live Nation", "status": "on_sale"},
        {"artist": artists[3], "title": "Music of the Spheres - Kaohsiung", "days": 55, "location": "Kaohsiung, Taiwan", "venue": "World Games Stadium", "price_range": "$70-$200", "platform": "Kktix", "organizer": "Live Nation", "status": "upcoming"},
        {"artist": artists[3], "title": "Music of the Spheres - Singapore", "days": 80, "location": "Singapore", "venue": "National Stadium", "price_range": "$90-$280", "platform": "Ticketmaster", "organizer": "Live Nation", "status": "upcoming"},
        # BLACKPINK
        {"artist": artists[4], "title": "Born Pink Tour - Tokyo", "days": 35, "location": "Tokyo, Japan", "venue": "Tokyo Dome", "price_range": "$100-$350", "platform": "Ticketmaster", "organizer": "YG Entertainment", "status": "lottery_open"},
        {"artist": artists[4], "title": "Born Pink Tour - Bangkok", "days": 65, "location": "Bangkok, Thailand", "venue": "Rajamangala Stadium", "price_range": "$80-$300", "platform": "Ticketmaster", "organizer": "YG Entertainment", "status": "upcoming"},
        # Ed Sheeran
        {"artist": artists[5], "title": "Mathematics Tour - Osaka", "days": 40, "location": "Osaka, Japan", "venue": "Kyocera Dome", "price_range": "$70-$200", "platform": "Ticketmaster", "organizer": "AEG", "status": "on_sale"},
        {"artist": artists[5], "title": "Mathematics Tour - Manila", "days": 70, "location": "Manila, Philippines", "venue": "Philippine Arena", "price_range": "$50-$180", "platform": "Ticketmaster", "organizer": "AEG", "status": "upcoming"},
        # The Weeknd
        {"artist": artists[6], "title": "After Hours Tour - Tokyo", "days": 45, "location": "Tokyo, Japan", "venue": "Saitama Super Arena", "price_range": "$90-$280", "platform": "Ticketmaster", "organizer": "Live Nation", "status": "upcoming"},
        {"artist": artists[6], "title": "After Hours Tour - Seoul", "days": 100, "location": "Seoul, Korea", "venue": "Gocheok Sky Dome", "price_range": "$80-$250", "platform": "Ticketmaster", "organizer": "Live Nation", "status": "upcoming"},
        # TWICE
        {"artist": artists[7], "title": "Ready To Be - Tokyo", "days": 22, "location": "Tokyo, Japan", "venue": "Tokyo Dome", "price_range": "$80-$220", "platform": "Peatix", "organizer": "JYP Entertainment", "status": "on_sale"},
        {"artist": artists[7], "title": "Ready To Be - Osaka", "days": 52, "location": "Osaka, Japan", "venue": "Kyocera Dome", "price_range": "$80-$220", "platform": "Peatix", "organizer": "JYP Entertainment", "status": "upcoming"},
        {"artist": artists[7], "title": "TWICE Fan Meeting - Seoul", "days": 85, "location": "Seoul, Korea", "venue": "KSPO Dome", "price_range": "$50-$120", "platform": "Ticketmaster", "organizer": "JYP Entertainment", "status": "upcoming"},
        # Yorushika
        {"artist": artists[8], "title": "Yorushika Live Tour - Tokyo", "days": 18, "location": "Tokyo, Japan", "venue": "Budokan", "price_range": "$60-$120", "platform": "Peatix", "organizer": "Universal Music", "status": "on_sale"},
        {"artist": artists[8], "title": "Yorushika Live Tour - Nagoya", "days": 38, "location": "Nagoya, Japan", "venue": "Zepp Nagoya", "price_range": "$50-$100", "platform": "Peatix", "organizer": "Universal Music", "status": "lottery_open"},
        {"artist": artists[8], "title": "Yorushika Live Tour - Osaka", "days": 58, "location": "Osaka, Japan", "venue": "Zepp Osaka Bayside", "price_range": "$50-$100", "platform": "Peatix", "organizer": "Universal Music", "status": "upcoming"},
        # Kenshi Yonezu
        {"artist": artists[9], "title": "Kenshi Yonezu Tour - Tokyo", "days": 28, "location": "Tokyo, Japan", "venue": "Tokyo Dome", "price_range": "$70-$180", "platform": "Peatix", "organizer": "Sony Music", "status": "lottery_open"},
        {"artist": artists[9], "title": "Kenshi Yonezu Tour - Osaka", "days": 48, "location": "Osaka, Japan", "venue": "Osaka-Jo Hall", "price_range": "$70-$180", "platform": "Peatix", "organizer": "Sony Music", "status": "upcoming"},
        {"artist": artists[9], "title": "Kenshi Yonezu Tour - Fukuoka", "days": 68, "location": "Fukuoka, Japan", "venue": "Marine Messe Fukuoka", "price_range": "$60-$150", "platform": "Peatix", "organizer": "Sony Music", "status": "upcoming"},
    ]

    for cd in concerts_data:
        concert_date = now + timedelta(days=cd["days"])
        ticket_start = concert_date - timedelta(days=30) if cd["status"] == "on_sale" else concert_date - timedelta(days=14)
        lottery_date = concert_date - timedelta(days=45) if cd["status"] == "lottery_open" else None

        concert = Concert(
            artist_id=cd["artist"].id,
            title=cd["title"],
            date=concert_date,
            location=cd["location"],
            venue=cd["venue"],
            price_range=cd["price_range"],
            ticket_start_date=ticket_start,
            lottery_registration_date=lottery_date,
            platform=cd["platform"],
            organizer=cd["organizer"],
            official_link=f"https://example.com/concerts/{cd['title'].lower().replace(' ', '-')}",
            status=cd["status"],
        )
        db.add(concert)

    db.commit()
    db.close()
    print(f"Seeded {len(artists_data)} artists and {len(concerts_data)} concerts.")


if __name__ == "__main__":
    seed()
