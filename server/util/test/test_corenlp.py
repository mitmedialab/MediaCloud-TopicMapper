import unittest

from server.util.corenlp import quotes_from_text, _fetch_annotations


class CorenlpTest(unittest.TestCase):

    def testRealDataForQuotes(self):
        text = """
        Vice President Mike Pence announced Thursday that Israel's Prime Minister and opposition leader will visit the White House next week to discuss "regional issues as well as the prospect of peace." The announcement comes as reports suggest a potential reveal of the Trump administration's Middle East peace plan could be imminent.
        Pence, who was in Jerusalem for a gathering of world leaders to mark the 75th anniversary of the liberation of Auschwitz, extended the invitation to Prime Minister Benjamin Netanyahu from President Donald Trump. He also announced that Blue and White chairman Benny Gantz will also attend the meeting at the White House on Tuesday.
        In a tweet Trump appeared to dash speculation an announcement on the peace plan may be imminent. "The United States looks forward to welcoming Prime Minister @Netanyahu & Blue & White Chairman @Gantzbe to the @WhiteHouse next week. Reports about details and timing of our closely-held peace plan are purely speculative," he tweeted.
        The unveiling of the plan, which is being spearheaded by Trump's senior adviser and son-in-law Jared Kushner, has been delayed amid the months-long period of turmoil in Israeli politics with the country due to hold an unprecedented third national election in less than a year in March.
        Israel heads for unprecedented third election in a year, as Netanyahu clings to power
        Israel heads for unprecedented third election in a year, as Netanyahu clings to power
        The two previous elections have failed to produce a clear winner and both Netanyahu and Gantz have failed in efforts to form a new government.
        Seated next to Pence at the US embassy in Jerusalem as he accepted the White House invitation, Netanyahu spoke of an "historic opportunity" for Israel.
        And he ramped up the pressure on Gantz, saying, "With such friends in the White House, with such backing from the United States, we should get as broad a consensus as possible around the efforts to achieve security and peace for the state of Israel."
        As well as a third election campaign, Netanyahu also has the prospect of a possible criminal trial hanging over him on charges of bribery and fraud and breach of trust.
        He denies any wrongdoing and has asked for immunity from prosecution.
        An Israeli parliamentary committee is due to start debating his request on Tuesday, the same day he is expected to meet Trump in Washington.
        The Trump administration released the economic portion of its peace plan during a conference with mainly regional officials in Bahrain last June, but it has yet to unveil the political portion, which will address the most intractable issues -- like the matter of Palestinian statehood, the status of Jerusalem and the fate of Palestinian refugees -- to resolving the conflict.
        CNN's Maegan Vazquez contributed to this report.'
        """
        quotes = quotes_from_text(text)
        assert len(quotes) == 4


    def testAnnotate(self):
        results = _fetch_annotations('This is some text with a quote, like "Help me" which was said by Rahul Bhargava')
        assert 'sentences' in results
        assert len(results['sentences']) == 1
        assert 'quotes' in results
        assert len(results['quotes']) == 1
        assert 'speaker' in results['quotes'][0]
        assert results['quotes'][0]['speaker'] == 'Rahul Bhargava'

    def testQuotesFromText(self):
        text = "Homeland Security chief on killed Kate Steinle: ‘Who?’\n\n  \n\n \n\n \n        \n        \t\t\t\t\n        \n        \n\n \n            \n\n \n\n     \n  \n\n\n                    \n\n   Text smaller   \n\n\n                    \n\n  Text bigger  \n\n\n                 \n             \n\n\n                     \n\n\n\n        \n\n \n\n\n Jeh Johnson, the secretary of the of Homeland Security, caused a firestorm on Capitol Hill when he was asked if federal authorities had contacted the family of the woman allegedly killed by an illegal immigrant – a story that’s shaken the nation and gone viral among the media – and he answered with little more than a shrug of the shoulders. \n\n\n\n\n Johnson professed no knowledge of the family. \n\n\n\n\n   Get the hottest, most important news stories on the Internet – delivered FREE to your inbox as soon as they break! Take just 30 seconds and sign up for WND’s Email News Alerts!   \n\n\n\n\n Specifically, he was asked during a congressional hearing if the White House or anyone in his department had contacted the family of Kate Steinle. \n\n\n\n\n “To who?” Johnson said. \n\n\n\n\n Rep. Steve Chabot replied: “To the family of the woman who was brutally murdered by this individual who had committed seven different felonies in four different states and my understanding had been deported, kept coming back, has the administration reached out to that family?” \n\n\n\n\n And Johnson’s answer: “I’m sorry, I don’t know the answer to that question, sir.” \n\n\n\n\n Conservative radio hosts Mark Levin and Michael Savage both expressed disbelief and outrage at Johnson’s response. \n\n\n\n\n Rush Limbaugh, meanwhile, said: “He doesn’t know who she is. The director of Homeland Security has no idea, when he hears the name Steinle family, he doesn’t know who it is.” \n\n\n\n\n And Bill O’Reilly, host of Fox News’ “The O’Reilly Factor,” said it was “hard to believe” Johnson didn’t recognize the Steinle name. \n\n\n        \n                                               \n        \n        \n\n \n            \n\n \n\n     \n  \n\n\n                    \n\n   Text smaller   \n\n\n                    \n\n  Text bigger  \n\n\n                 \n             \n\n\n                            \n\n \n                                     \n\n\n                     \n\n\n\n        \n                            \n                             \n\n\n        \n                     \n\n  "
        quotes = quotes_from_text(text)
        assert len(quotes) == 7

    def testNoQuotes(self):
        quotes = quotes_from_text('This is some text with no quotes all all. Move along. Nothing to see here')
        assert len(quotes) == 0


if __name__ == "__main__":
    unittest.main()
