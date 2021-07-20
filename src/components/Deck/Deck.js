import { useEffect, useRef, useState } from "react"
import Card from "../Card/Card"
import axios from "axios"
import "./Deck.css"

const baseUrl = "http://deckofcardsapi.com/api/deck"

const Deck = () => {
    const [deck, setDeck] = useState(null)
    const [drawn, setDrawn] = useState([])
    const [autoDraw, setAutoDraw] = useState(false)
    const timerRef = useRef(null)

    /* Upon component mounting,
    load deck from API into state */
    useEffect(() => {
        async function getData() {
            let d = await axios.get(`${baseUrl}/new/shuffle`)
            setDeck(d.data)
        }
        getData()
    }, [setDeck])

    /* If autoDraw is true, 
    draw a card every second */
    useEffect(() => {
        async function drawCard() {
            let { deck_id } = deck

            try {
                let drawRes = await axios.get(`${baseUrl}/${deck_id}/draw/`)

                if (drawRes.data.remaining === 0) {
                    setAutoDraw(false)
                    throw new Error("No cards left in the deck!")
                }

                const card = drawRes.data.cards[0]

                setDrawn(d => [
                    ...d,
                    {
                        id: card.code,
                        name: card.suit + " " + card.value,
                        image: card.image
                    }
                ])
            } catch(e) {
                alert(e)
            }
        }

        if (autoDraw && !timerRef.current) {
            timerRef.current = setInterval(async () => {
                await drawCard()
            }, 1000)
        }

        return () => {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [autoDraw, setAutoDraw, deck])

    const toggleAutoDraw = () => (
        setAutoDraw(auto => !auto)
    )

    const cards = drawn.map(c => (
        <Card key={c.id} name={c.name} image={c.image} />
    ))

    return (
        <div className="Deck">
            {deck ? (
                <button className="Deck-button" onClick={toggleAutoDraw}>
                    {autoDraw ? "STOP" : "KEEP"} DRAWING FOR ME!
                </button>
            ) : null}
            <div className="Deck-cardarea">{cards}</div>
        </div>
    )
}

export default Deck