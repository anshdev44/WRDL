"use client";
import Nav from "../components/nav";

export default function About() {
    return (
        <div className="min-h-screen bg-black text-white mt-20">
            <div className="relative z-10">
                <Nav />

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <section className="mb-16">
                        <h1 className="text-4xl font-semibold tracking-tight mb-4">About WRDL</h1>
                        <p className="text-gray-300 leading-8 text-lg">
                            WRDL is a competitive word-guessing game designed for live multiplayer rooms. Players collaborate
                            and compete in real time as letters of a hidden word are gradually revealed. The objective is to
                            correctly identify the word before time runs out while managing score and momentum within the room.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4">Game Experience</h2>
                        <p className="text-gray-300 leading-8 mb-4">
                            Each match is organized into a room where participants can join using a shared room code. Once the
                            round begins, a hidden word is selected and letters are exposed incrementally over a fixed time window.
                            Players enter guesses in real time and earn points based on how quickly they arrive at the correct answer.
                        </p>
                        <p className="text-gray-300 leading-8">
                            The game balances speed with deduction. Early correct answers receive the highest score, while later
                            guesses still contribute to the overall competition. Incorrect guesses impose a penalty, which encourages
                            thoughtful play and discourages random submissions.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
                        <div className="space-y-6 text-gray-300 leading-8">
                            <div>
                                <h3 className="font-medium text-white mb-2">Join or create a room</h3>
                                <p>
                                    Start a new game room or join an existing one with a room code. Once connected, your activity is
                                    visible to everyone in the room and the game begins when the host starts the round.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-white mb-2">Track the timer and reveals</h3>
                                <p>
                                    A countdown timer runs for each round. Letters are revealed at intervals, giving players a steady
                                    stream of clues as the hidden word becomes clearer.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-white mb-2">Submit guesses strategically</h3>
                                <p>
                                    Correct guesses earn points according to placement. The earliest accurate guess earns the most,
                                    and later correct answers score lower. Incorrect answers reduce your score, so it is important to
                                    guess carefully.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Design Goals</h2>
                        <p className="text-gray-300 leading-8 mb-4">
                            WRDL is intended to deliver an engaging multiplayer experience with clear rules and fast-paced interaction.
                            The game emphasizes shared discovery, competitive scoring, and the satisfaction of solving a word under time
                            pressure.
                        </p>
                        <p className="text-gray-300 leading-8">
                            By focusing on room-based play and real-time feedback, WRDL creates a dynamic environment where players can
                            test their vocabulary, pattern recognition, and response time in a polished, intuitive interface.
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
}
