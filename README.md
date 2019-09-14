# companion-caspar-configurator

> A standalone program that automatically creates buttons in [Bitfocus Companion](https://bitfocus.io/companion/) to play videos present in a CasparCG setup, with support for complex dynamically-generated macros.

## Table of Contents

-   [Motivation](#motivation)
-   [Operator Workflow](#operator-workflow)
-   [Installing the program](#installing-the-program)
-   [Creating a Ruleset](#creating-a-ruleset)
-   [Configuring the program](#configuring-the-program)
-   [Running the program](#running-the-program)

## Motivation

First, it is important to state that this is a solution for shows with little to no budget. If you can afford an EVS and an enterprise MAM system, then this program likely has no value to you. If you don't know what those things are or know you can't afford them, then this program might be for you.

Video playout on a budget is hard. You're running a scrappy barebones show, and you've got ads and pre-produced video packages to play. Your setup is nothing more than a pile of computers (probably with Decklink cards) and maybe an ATEM. Playing a video requires touching multiple pieces of hardware and coordinating multiple people. It's hard and all you can think about are all the places where mistakes can easily be made.

How can this be improved? How do you play videos easily in a show with a small budget? What happens when things change and new videos get added mid-show? This program gives you a zero-cost workflow for addressing these problems, and it does this by gluing together two existing pieces of software: [Bitfocus Companion](https://bitfocus.io/companion/) (for the UI & controls) and [CasparCG](https://www.casparcg.com/) (for the actual video rendering and playout).

## Operator Workflow

-   Add videos to your CasparCG media directory.
-   Press a button on your Bitfocus Companion to play the video.

That's it. That's the entire operator experience. Your editors can deliver new videos as often as they like, place them into your CasparCG media directory, and within 30 seconds your operators will have a nice little button to press to play that video according to your pre-defined rules.

The following sections explain how to go about setting up this program to achieve this workflow.

## Installing the program

1. [Install Node.js (version 10 or later)](https://nodejs.org)
2. [Download and extract the latest version of `companion-caspar-configurator`](https://github.com/TipoftheHats/companion-caspar-configurator/archive/master.zip)
3. Open your terminal (or command prompt) and `cd` into the `companion-caspar-configurator` directory
4. Run `npm i` to install its dependencies

## Creating a Ruleset

To achieve this simple user experience, we unfortunately must have a fairly complex config. This is because simply telling CasparCG to play a video is rarely adequate. We must often coordinate multiple other pieces of gear and software in our show when it's time to play a video package. The Ruleset definition file is how this gets done.

Since these Rulesets are pretty complex, we prefer to author them in TypeScript so that the compiler can catch the most common mistakes. Even if you don't like or haven't used TypeScript, I encourage you to try it out for this use case -- I promise you won't have to set up any compiler options or anything like that.

Here's an example Ruleset, with a bunch of comments explaning the various parts:

```ts
import { Ruleset, ClipMetadata } from './src/types/ruleset';
import * as Companion from './src/types/companion';

/**
 * Companion relies on the concept of Instances of the various
 * hardware devices in your setup. It assigns short, random,
 * unique string IDs to each of these instances.
 *
 * Since the entire point of our Actions is to manipulate these
 * Instances, we have to refer to them somehow. Writing
 * the ID over and over by hand or copy/paste is dangerous.
 *
 * But, because this Ruleset file is just code,
 * we can easily create a solution to this problem that
 * lets us define our instance IDs in one place,
 * then freely reference them in the rest of the file.
 */
const instances = {
	caspar: 'H1tqYjM9X',
	atem: 'H1TUFofcX',
	http: 'SkOjFiMqm',
};

const ruleset: Ruleset = {
	/**
	 * What Pages this program has control over.
	 * When this program updates Companion, it will delete ALL
	 * Buttons present on these Pages, and replace them with
	 * fresh Buttons as computed by this Ruleset.
	 *
	 * If there are not enough Pages for all the Buttons that this Ruleset
	 * wants to create, it will write as many Buttons as it can and log an error.
	 */
	page_ranges: [
		// Start at 4, end at 14 (both numbers are inclusive).
		[4, 14],

		// You could define more ranges here if you wanted to.
	],

	/**
	 * This is the meat of this program: the acutal Button templates.
	 * This is an array of Rules. Each Rule applies to one Folder in Caspar.
	 */
	template_rules: [
		{
			// Defines what folder within the Caspar media Folder that this Rule applies to.
			folder: 'ADS',

			// The Actions to apply to each Button created by this Rule.
			// A new Button is made for each File in this Rule's Folder.
			actions: clip => {
				return [
					// These Actions are just examples -- you can make any
					// Action that Companion supports, with any Options.

					// Plays the video in Caspar.
					{
						label: `${instances.caspar}:PLAY`,
						instance: instances.caspar,
						action: 'PLAY',
						options: {
							channel: 1,
							layer: '11',
							loop: 'false',
							auto: 'false',
							transition: 'MIX',
							transition_duration: '30',
							transition_tween: 'linear',
							clip: clip.filename,
						},
						delay: '0',
					},

					// Sends a CUT command to an ATEM at the specified `delay`.
					{
						label: `${instances.atem}:cut`,
						instance: instances.atem,
						action: 'cut',
						options: {
							mixeffect: 0,
						},

						// Note how we're able to compute this Action
						// based on the metadata of the Clip. Powerful!
						delay: `${clip.duration.milliseconds - 3500}`,
					},

					// Sends a POST to some HTTP server when the ad ends.
					{
						label: `${instances.http}:post`,
						instance: instances.http,
						action: 'post',
						options: {
							url: `https://example.com/ad_ended`,
						},
						delay: `${clip.duration.milliseconds + 1000}`,
					},
				];
			},

			/**
			 * Defines what the visual appearance of the Buttons
			 * created by this Ruleset is.
			 * This function gets run independently for each Clip/Button.
			 */
			config: clip => {
				return {
					// Some fields have Enums of all the possible values.
					// You literally cannot enter a wrong value in these fields!
					// The program will error on startup and reject your Ruleset.
					alignment: Companion.Alignment.CenterCenter,
					bgcolor: 0,
					color: 16777215,
					size: Companion.Size.Auto,
					style: Companion.Style.Text,

					// Again, we're able to use the Clip Metadata
					// to compute values. Super handy!
					text: clip.filename.replace(/\//g, '\\n'),
				};
			},
		},
	],
};

// Export the ruleset so that `companion-caspar-configurator` can access it.
export default ruleset;
```

## Configuring the program

Now that you have your Ruleset, you need to write one more (small) config file: the config for the program itself. This file is in JSON format, and lives as `config.json` in the root directory of the program, adjacent to its `package.json` file.

The config is how we tell the program where to connect to our Companion and Caspar instances. It's also how we tell it where to load our Rulesets from.

Here's an example `config.json` showing all the default values:

```json
{
	"companion_url": "http://127.0.0.1:8000",
	"rulesets": ["./ruleset.ts"],
	"caspar_cg": {
		"host": "127.0.0.1",
		"port": 5250
	},
	"debug": false
}
```

## Running the program

Just run the following from your terminal/command prompt while in the `companion-caspar-configurator` directory:

```bash
npm start
```

If there's an error in your Ruleset, the program will immediately log an error and exit. The errors might be kind of hard to read, because Typescript doesn't always produce the most friendly error messages. However, I believe this is better than letting that error silently get through, so it's a small price to pay to protect yourself from 2AM typos made the night before going live.

## Thanks

Thanks to [@justinkim](https://github.com/justinkim) and [@faultyserver](https://github.com/faultyserver) for consulting with me ([@Lange](https://github.com/lange)) on the Ruleset format and overall architecture of this program.

## License

[MIT](LICENSE)
