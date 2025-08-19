// ==UserScript==
// @name         Pokémon Deluge Auto-Search
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automates the search and detection of Pokémon
// @author       devlucascardoso
// @match        https://www.delugerpg.com/map/*
// @grant        none
// ==/UserScript==

// NOTICE: I strongly recommend running this code only in the browser console to avoid potential bans.
// DISCLAIMER: This script is provided for educational purposes only, with no intent to encourage cheating or violating the rules of Pokémon Deluge. The author is not responsible for any consequences, including account bans, resulting from the use of this script. Use at your own risk.

(function() {
    'use strict';

    const POKE_D_URL = "https://i.dstatic.com/images/poke-d.png";
    const POKE_E_URL = "https://i.dstatic.com/images/poke-e.png";
    const MODAL_IMAGE_SELECTOR = '#DMbody #pinforight img[alt="n"]';
    const CATCH_BUTTON_SELECTOR = 'input.btn-catch_action#catchmon';
    const POKEMON_LINK_SELECTOR = 'a.dexpop';
    const SPECIAL_POKEMON_CLASSES = ['Shiny', 'Retro', 'Negative', 'Chrome'];
    const NEW_POKEMON_TITLE = 'You don\'t have this pokemon in your box.';
    const MAP_CONTEXT_ID = 'mapcontext';
    const MOVE_UP_ID = 'dr-n';
    const MOVE_DOWN_ID = 'dr-s';
    const MOVE_DELAY = 1250;
    const MODAL_LOAD_DELAY = 500;
    const ALERT_DELAY = 2000;

    let walkingUp = true;
    let poke = null;
    let isRunning = true;

    const up = document.getElementById(MOVE_UP_ID);
    const down = document.getElementById(MOVE_DOWN_ID);

    // Function for delay with random variation
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms + Math.random() * 100));

    // Function to toggle the script state
    function toggleScript() {
        isRunning = !isRunning;
        console.log(isRunning ? 'Script resumed.' : 'Script paused.');
        const button = document.getElementById('pokemon-script-toggle');
        if (button) {
            button.innerText = isRunning ? 'Pause Script' : 'Resume Script';
            button.style.backgroundColor = isRunning ? '#ff4444' : '#44ff44';
        }
        if (isRunning) {
            findPokemon(); // Resumes the loop if the script is activated
        }
    }

    // Creates the control button
    function createControlButton() {
        const button = document.createElement('button');
        button.id = 'pokemon-script-toggle';
        button.innerText = 'Pause Script';
        button.style.position = 'fixed';
        button.style.top = '20px';
        button.style.right = '20px';
        button.style.zIndex = '9999';
        button.style.padding = '10px';
        button.style.backgroundColor = '#ff4444';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';

        button.addEventListener('click', toggleScript);
        document.body.appendChild(button);
    }

    // Checks the image in the modal and decides whether to catch the Pokémon
    async function checkImageAndCompare() {
        const imgElement = document.querySelector(MODAL_IMAGE_SELECTOR);
        if (imgElement) {
            if (imgElement.src === POKE_D_URL) {
                const catchButton = document.querySelector(CATCH_BUTTON_SELECTOR);
                if (catchButton) {
                    catchButton.click();
                }
                return true;
            } else if (imgElement.src === POKE_E_URL) {
                return false;
            }
        }
        return false;
    }

    // Simulates a click on a link and checks the modal
    async function simulateClickAndCheck(linkElement) {
        if (linkElement) {
            linkElement.click();
            await delay(MODAL_LOAD_DELAY);
            return checkImageAndCompare();
        }
        return false;
    }

    // Checks conditions to stop the loop
    function shouldStopLoop(elementsWithTitle, poke) {
        const hasNewPokemon = elementsWithTitle.length > 0;
        const hasText = poke !== null && poke.innerText.trim() !== "";
        const hasSpecialPokemon = SPECIAL_POKEMON_CLASSES.some(className =>
                                                               document.querySelectorAll(`[data-class*="${className}"]`).length > 0
                                                              );

        return (hasNewPokemon || (hasText && hasSpecialPokemon));
    }

    // Controls the character's movement (up or down)
    function moveCharacter() {
        const direction = walkingUp ? up : down;
        direction.click();
        walkingUp = !walkingUp;
    }

    // Checks all Pokémon links on the map
    async function checkPokemonLinks() {
        const pokemonLinks = document.querySelectorAll(POKEMON_LINK_SELECTOR);
        for (const link of pokemonLinks) {
            const shouldStop = await simulateClickAndCheck(link);
            if (shouldStop) {
                return true; // Indicates that the script should stop
            }
        }
        return false; // Continues the loop
    }

    // Main loop to find Pokémon
    async function findPokemon() {
        while (isRunning) {
            moveCharacter();
            await delay(MOVE_DELAY);
            poke = document.getElementById(MAP_CONTEXT_ID);

            const shouldStop = await checkPokemonLinks();
            if (shouldStop) {
                isRunning = false; // Stops the script
                const button = document.getElementById('pokemon-script-toggle');
                if (button) {
                    button.innerText = 'Resume Script';
                    button.style.backgroundColor = '#44ff44';
                }
                return;
            }

            const elementsWithTitle = document.querySelectorAll(`[title="${NEW_POKEMON_TITLE}"]`);
            if (shouldStopLoop(elementsWithTitle, poke)) {
                isRunning = false; // Stops the script
                const button = document.getElementById('pokemon-script-toggle');
                if (button) {
                    button.innerText = 'Resume Script';
                    button.style.backgroundColor = '#44ff44';
                }
                break;
            }
        }
    }

    // Waits for the page to fully load
    window.addEventListener('load', () => {
        console.log('Page loaded. Starting script...');
        createControlButton();
        findPokemon();
    });

    // Checks if the page is already loaded
    if (document.readyState === 'complete') {
        console.log('Page was already loaded. Starting script immediately...');
        createControlButton();
        findPokemon();
    }

    // Exposes the toggleScript function for manual use in the console
    window.togglePokemonScript = toggleScript;
})();
