const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits = ['♠', '♥', '♣', '♦'];

let allDecks = [];
let dealerHand = [];
let playerHand = [];
let currentBet = 0;
let remainingBalance = 1000;

const cardModel = document.createElement('div');
cardModel.classList.add('card');

const dealer = document.getElementById("dealer");
const player = document.getElementById("player");
const hit = document.getElementById("hit");
const pass = document.getElementById("pass");
const buttonContainer = document.getElementById("button-container");
const notice = document.getElementById("notice");
const nextHand = document.getElementById("next-hand");
const gameBalanceDisplay = document.getElementById('game-balance');
const currentBetDisplay = document.getElementById('current-bet');

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('chip5').addEventListener('click', () => setBetAndStart(5));
    document.getElementById('chip10').addEventListener('click', () => setBetAndStart(10));
    document.getElementById('chip25').addEventListener('click', () => setBetAndStart(25));
    document.getElementById('chip100').addEventListener('click', () => setBetAndStart(100));
    document.getElementById('hit').addEventListener('click', hitPlayer);
    document.getElementById('pass').addEventListener('click', hitDealer);
    document.getElementById('double').addEventListener('click', double);
    document.getElementById('next-hand').addEventListener('click', play);
});


const createDeck = () => {
    const deck = [];
    suits.forEach((suit) => {
        values.forEach((value) => {
            const card = value + suit;
            deck.push(card);
        });
    });
    return deck;
};

const shuffleDecks = (num) => {
    for (let i = 0; i < num; i++) {
        const newDeck = createDeck();
        allDecks = [...allDecks, ...newDeck];
    }
};

const chooseRandomCard = () => {
    const totalCards = allDecks.length;
    let randomNumber = Math.floor(Math.random() * totalCards);
    const randomCard = allDecks[randomNumber];
    allDecks.splice(randomNumber, 1);
    return randomCard;
};

const dealHands = async () => {
    dealerHand = [await chooseRandomCard(), await chooseRandomCard()];
    playerHand = [await chooseRandomCard(), await chooseRandomCard()];
    return { dealerHand, playerHand };
};

const calcHandValue = (hand) => {
    let value = 0;
    let hasAce = false;
    hand.forEach((card) => {
        let cardValue = card.length === 2 ? card.substring(0, 1) : card.substring(0, 2);
        if (cardValue === 'A') {
            hasAce = true;
            value += 11;
        } else if (cardValue === 'J' || cardValue === 'Q' || cardValue === 'K') {
            value += 10;
        } else {
            value += Number(cardValue);
        }
    });
    if (hasAce && value > 21) {
        value -= 10;
    }
    return value;
};

const showNotice = (text) => {
    notice.children[0].children[0].innerHTML = text;
    notice.style.display = "flex";
    buttonContainer.style.display = "none";
};

const updateDisplays = () => {
    gameBalanceDisplay.innerHTML = `Game Balance: $${remainingBalance}`;
    currentBetDisplay.innerHTML = `Current Bet: $${currentBet}`;
    updatePlayerHandValueDisplay(calcHandValue(playerHand));
};

const setBetAndStart = (amount) => {
    if (amount <= remainingBalance) {
        currentBet += amount;
        remainingBalance -= amount;
        updateDisplays();
        play();
    } else {
        alert("Nicht genügend Guthaben zum Wetten!");
    }
};

const play = async () => {
    if (allDecks.length < 10) shuffleDecks(1);
    clearHands();
    
    await dealHands();
    displayHands();
    updateDisplays();
};

const displayHands = () => {
    dealerHand.forEach((card, index) => {
        const newCard = cardModel.cloneNode(true);
        if (index === 0) {
            newCard.textContent = card;
        } else {
            newCard.textContent = '?';
            newCard.classList.add('card-back');
        }
        dealer.appendChild(newCard);
    });

    playerHand.forEach((card) => {
        const newCard = cardModel.cloneNode(true);
        newCard.textContent = card;
        player.appendChild(newCard);
    });
};

const clearHands = () => {
    dealerHand = [];
    playerHand = [];
    while (dealer.firstChild) dealer.removeChild(dealer.firstChild);
    while (player.firstChild) player.removeChild(player.firstChild);
};


const updatePlayerHandValueDisplay = (handValue) => {
    const playerHandValueDisplay = document.getElementById('player-hand-value');
    playerHandValueDisplay.innerHTML = `Hand Total: ${handValue}`;
};

const hitPlayer = async () => {
    const card = chooseRandomCard();
    playerHand.push(card);
    displaySingleCard(card, player);

    let handValue = calcHandValue(playerHand);
    updatePlayerHandValueDisplay(handValue);

    if (handValue > 21) {
        
        endGame();
    }
};

const hitDealer = async () => {
    let handValue = calcHandValue(dealerHand);

    while (handValue < 17) {
        const card = chooseRandomCard();
        dealerHand.push(card);
        displaySingleCard(card, dealer);
        handValue = calcHandValue(dealerHand);
    }

    updateDealerHandValueDisplay(handValue);
    determineWinner();
};

const double = async () => {
    if (currentBet * 2 > remainingBalance) {
        alert("Not enough balance to double down!");
        return;
    }


    remainingBalance -= currentBet;
    currentBet *= 2;

    const card = chooseRandomCard();
    playerHand.push(card);
    displaySingleCard(card, player);

    let handValue = calcHandValue(playerHand);
    updatePlayerHandValueDisplay(handValue);
    updateDisplays();


    if (handValue > 21) {
        showNotice(`Bust! Your hand value is ${handValue}.`);
    } else {
        await hitDealer();
    }

    determineWinner();
};

const displaySingleCard = (card, element) => {
    const newCard = cardModel.cloneNode(true);
    newCard.textContent = card;
    element.appendChild(newCard);
};
const updateDealerHandValueDisplay = (handValue) => {
    const dealerHandValueDisplay = document.getElementById('dealer-hand-value');
    dealerHandValueDisplay.innerHTML = `Hand Total: ${handValue}`;
};

const determineWinner = () => {
    const playerValue = calcHandValue(playerHand);
    const dealerValue = calcHandValue(dealerHand);
    const gameResultDisplay = document.getElementById('game-result'); 

    let message = '';
    if (playerValue > 21) {
        message = 'Bust! You lose.';
    } else if (dealerValue > 21 || playerValue > dealerValue) {
        remainingBalance += currentBet * 2; 
        message = 'You win!';
    } else if (dealerValue > playerValue) {
        message = 'Dealer wins. You lose.';
    } else {
        remainingBalance += currentBet;
        message = 'Push. It\'s a tie.';
    }

    gameResultDisplay.textContent = message;

    currentBet = 0;
    showNotice(message);
    updateDisplays();
    prepareForNextHand(); 
};


const prepareForNextHand = () => {
    clearHands();
    buttonContainer.style.display = "block";
    notice.style.display = "none";
};




hit.addEventListener('click', hitPlayer);
pass.addEventListener('click', hitDealer);
nextHand.addEventListener('click', play);

