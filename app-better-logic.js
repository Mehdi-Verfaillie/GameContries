// on stock les élements du DOM de manière groupé
var ui = {
    restart_screen: document.querySelector('#game-over'),
    restart_btn: document.querySelector('#game-over button'),
    start_screen: document.querySelector('#game-start'),
    start_btn: document.querySelector('#game-start button'),
    time_left: document.querySelector('.time span'),
    flags: document.querySelectorAll('.flag'),
    flags_img: document.querySelectorAll('.flag img'),
    title: document.querySelector('h2'),
    lives: document.querySelectorAll('.lives img'),
    score: document.querySelector('.score strong')
};

// on crée une copie des drapeaux
// pour voir comment fonctionne .slice
// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/slice
var flags_copy = flags.slice();
var time_left = 20;
var time_id;
var life_left = 3;
var score = 0;
var game_is_over = false;
var flag_to_find;
var flags_to_show;

// quand on click sur le bouton start
// on crée les évènements (une seule fois)
// on lance le jeu
// on vire l'écran d'accueil
ui.start_btn.addEventListener('click', function() {
    setEvents();
    startGame();

    ui.start_screen.classList.remove('is-open');
});

// quand on click sur le bouton REstart
// on réinitialise les valeurs par défaut
// on mets à jour l'affichage en conséquence
// on lance le jeu après avoir réinitialisé la liste des drapeaux
// on vire l'écran game over
ui.restart_btn.addEventListener('click', function() {
    time_left = 20;
    life_left = 3;
    score = 0;
    game_is_over = false;
    flags = flags_copy.slice();

    // réinitialiser l'affichage des vies
    for (var i = 0; i < ui.lives.length; i++) {
        ui.lives[i].classList.remove('is-active');
    }

    // réinitialiser l'affichage du temps + score
    ui.time_left.textContent = time_left;
    ui.score.textContent = score;

    startGame();

    ui.restart_screen.classList.remove('is-open');
});

// pour chaque éléments du DOM représentant un drapeau
// on ajoute un évènement au click
function setEvents() {
    for (var i = 0; i < ui.flags.length; i++) {
        addClickEventOnFlag(i);
    }
}

function addClickEventOnFlag(index) {
    ui.flags[index].addEventListener('click', function() {
        // si on est game over OU l'élément a déjà été cliqué
        // on arrête là
        if (game_is_over || ui.flags[index].classList.contains('is-active')) {
            return;
        }
        
        // les éléments du DOM ont les mêmes index que les données à montrer
        // si l'élément cliqué à le même nom que l'élément à trouver
        // alors on ajouter des points + on re affiche d'autres drapeaux
        // sinon, alors on enlève une vie et on désactive le drapeau
        if (flags_to_show[index].name === flag_to_find.name) {
            addScore();
            renderFlags();
        } else {
            removeLife();
            ui.flags[index].classList.add('is-active');
        }
    });
}

function renderFlags() {
    // on choisi un chiffre au hasard
    var random = Math.floor( Math.random() * flags.length );
    // on récupère l'objet pays à l'index de ce chiffre
    flag_to_find = flags[random];

    // on filtre les drapeaux pour supprimer le pays trouvé précédement
    flags = flags.filter(function(flag) {
        return flag.name !== flag_to_find.name;
    });

    // ici on a un algo compliqué
    // d'abord on crée un tableau de meilleurs match vide
    // ensuite on fait une copie des pays actuels en tant que
    // pays restants
    // tant que best_match n'a pas au moins 3 valeur
    // on re essaye de trouver le maximum de couleurs en commun - n
    // où n est l'indice de dégression
    var best_match = [];
    var new_best_match;
    var remaining = flags.slice();
    var match_index = -1;
    var colors = flag_to_find.colors;

    if (remaining.length > 3) {
        while (best_match.length < 3) {
            match_index++;

            new_best_match = remaining.filter(function (flag) {
                var count = 0;

                for (var i = 0; i < colors.length; i++) {
                    if (flag.colors.indexOf(colors[i]) > -1) {
                        count++;
                    }
                }

                return count === (colors.length - match_index);
            });

            remaining = remaining.filter(function(flag) {
                return new_best_match.indexOf(flag) === -1;
            });

            best_match = best_match.concat(new_best_match);
        }
    } else {
        best_match = remaining;
    }

    console.log(match_index, flag_to_find, best_match);

    // on prépare un tableau de pays à montrer
    // parmis les best_match, on prend les 3 premiers
    flags_to_show = best_match.slice(0, 3);
    // on ajoute le pays à trouver
    flags_to_show.push(flag_to_find);
    // on mélange les pays à montrer
    flags_to_show = shuffling(flags_to_show);

    // on fait une bouble pour les montrer
    // et on enlève les class actives si il y en a
    for (var i = 0; i < flags_to_show.length; i++) {
        var code = flags_to_show[i].code.toLowerCase();
        ui.flags_img[i].src = 'flags/' + code + '.svg';

        ui.flags[i].classList.remove('is-active');
    }

    // on affiche en titre, le pays à trouver
    ui.title.textContent = flag_to_find.name;
}

function startGame() {
    startTimer();
    renderFlags();
}

function startTimer() {
    time_id = setInterval(function() {
        time_left--;

        if (time_left <= 0) {
            gameOver();
        }

        ui.time_left.textContent = time_left;
    }, 1000);
}

function removeLife() {
    life_left--;

    if (life_left <= 0) {
        gameOver();
        return;
    }

    ui.lives[life_left].classList.add('is-active');
}

function gameOver() {
    game_is_over = true;
    clearInterval(time_id);
    ui.restart_screen.classList.add('is-open');
}

function shuffling(tab_to_shuffle) {
    // c'est ce qu'on appelle une permutation de mémoire
    // pensez au verre de coca et de fanta à permutter avec un 3ème verre
    var temp, random;

    for (var i = 0; i < tab_to_shuffle.length; i++) {
        random = Math.floor( Math.random() * tab_to_shuffle.length );
        temp = tab_to_shuffle[i];
        tab_to_shuffle[i] = tab_to_shuffle[random];
        tab_to_shuffle[random] = temp;
    }

    return tab_to_shuffle;
}

function addScore() {
    time_left += 5;
    score++;

    // on limite à 30
    if (time_left > 30) {
        time_left = 30;
    }

    ui.score.textContent = score;
}
