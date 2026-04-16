from app.config import settings

MOCK_ARTISTS = {
    "taylor swift": {
        "name": "Taylor Swift",
        "image_url": "https://placehold.co/300x300?text=Taylor+Swift",
        "genres": ["Pop", "Country"],
    },
    "bts": {
        "name": "BTS",
        "image_url": "https://placehold.co/300x300?text=BTS",
        "genres": ["K-Pop", "Hip-Hop"],
    },
    "adele": {
        "name": "Adele",
        "image_url": "https://placehold.co/300x300?text=Adele",
        "genres": ["Pop", "Soul"],
    },
    "coldplay": {
        "name": "Coldplay",
        "image_url": "https://placehold.co/300x300?text=Coldplay",
        "genres": ["Rock", "Alternative"],
    },
    "blackpink": {
        "name": "BLACKPINK",
        "image_url": "https://placehold.co/300x300?text=BLACKPINK",
        "genres": ["K-Pop", "Dance"],
    },
    "ed sheeran": {
        "name": "Ed Sheeran",
        "image_url": "https://placehold.co/300x300?text=Ed+Sheeran",
        "genres": ["Pop", "Folk"],
    },
    "the weeknd": {
        "name": "The Weeknd",
        "image_url": "https://placehold.co/300x300?text=The+Weeknd",
        "genres": ["R&B", "Pop"],
    },
    "twice": {
        "name": "TWICE",
        "image_url": "https://placehold.co/300x300?text=TWICE",
        "genres": ["K-Pop", "Dance"],
    },
    "yorushika": {
        "name": "Yorushika",
        "image_url": "https://placehold.co/300x300?text=Yorushika",
        "genres": ["J-Rock", "Alternative"],
    },
    "kenshi yonezu": {
        "name": "Kenshi Yonezu",
        "image_url": "https://placehold.co/300x300?text=Kenshi+Yonezu",
        "genres": ["J-Pop", "Rock"],
    },
}


async def search_artists(query: str) -> list[dict]:
    if settings.TICKETMASTER_API_KEY:
        return await _search_ticketmaster(query)
    return _search_mock(query)


def _search_mock(query: str) -> list[dict]:
    query_lower = query.lower()
    results = []
    for key, artist in MOCK_ARTISTS.items():
        if query_lower in key:
            results.append({**artist, "source": "mock"})
    return results


async def _search_ticketmaster(query: str) -> list[dict]:
    import httpx

    url = "https://app.ticketmaster.com/discovery/v2/attractions.json"
    params = {
        "apikey": settings.TICKETMASTER_API_KEY,
        "keyword": query,
        "size": 10,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        if resp.status_code != 200:
            return _search_mock(query)
        data = resp.json()

    attractions = data.get("_embedded", {}).get("attractions", [])
    results = []
    for a in attractions:
        images = a.get("images", [])
        image_url = images[0]["url"] if images else ""
        genres_list = []
        for classification in a.get("classifications", []):
            genre = classification.get("genre", {}).get("name", "")
            if genre and genre != "Undefined":
                genres_list.append(genre)
        results.append({
            "name": a.get("name", ""),
            "image_url": image_url,
            "genres": genres_list,
            "source": "ticketmaster",
        })
    return results
