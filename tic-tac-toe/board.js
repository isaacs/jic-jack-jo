if (typeof(exports) === "undefined") exports = {};

exports.Board = function (game) {

    var active,
        events = {},
        history,
        state,
        turn,
        winner;
    
    if (game) init(game);

    function init (game) {
        game = game || {};
        active = game.win ? false : true;
        history = game.history || [];
        state = game.state || [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        turn = game.turn || 'x';
        winner = game.win || null;

        fire('init', state);

    };

    /**
     * Check the board to see if the game is still active. Sets the winner if not
     * @return {Boolean} True if the game is still active
     */
    var check = (function() {

        var coords = [
            [[0, 0], [1, 0], [2, 0]],
            [[0, 1], [1, 1], [2, 1]],
            [[0, 2], [1, 2], [2, 2]],
            [[0, 0], [0, 1], [0, 2]],
            [[1, 0], [1, 1], [1, 2]],
            [[2, 0], [2, 1], [2, 2]],
            [[0, 0], [1, 1], [2, 2]],
            [[2, 0], [1, 1], [0, 2]]
        ];

        function match (coords) {

            var i,
                x = coords[0][0],
                y = coords[0][1],
                piece = state[x][y];

            if (!piece) return;

            for (i = 1; i < coords.length; i++) {
                x = coords[i][0];
                y = coords[i][1];
                if (state[x][y] != piece) return false;
            }

            return piece;

        };

        return function() {

            var found, i;

            for (i = 0; i < coords.length; i++) {
                found = match(coords[i]);
                if (found) {
                    active = false;
                    winner = found;
                    return false;
                };
            }

            active = (history.length < 9);

            return active;

        };

    })();

    /**
     * Fire a custom event
     * @param {String} e The name of the event to fire
     * @param {Object} args The arguments to pass in
     */
    function fire (e, args) {
        if (events[e]) events[e](args);
    };

    /**
     * Get the valid moves available
     * @return {Array} An array of [x, y] coords
     */
    function getMoves () {

        var moves = [],
            x, y;

        for (x = 0; x < state.length; x++) {
            for (y = 0; y < state[x].length; y++) {
                if (!state[x][y]) moves.push([x, y]);
            }
        }

        return moves;

    };

    /**
     * @return {String} Whose turn it is ("x" or "o")
     */
    function getTurn () {
        return turn;
    };

    /**
     * @return {String} The winner ("x" or "o")
     */
    function getWinner () {
        return winner;
    };
    
    /**
     * @return {Array<Array<String>>} The game state array
     **/
    function getState () {
        return state;
    };
    
    /**
     * @return {Array<Move>} The array of past moves.
     **/
    function getHistory () {
        return history;
    };
    
    /**
     * @return {Boolean} True if the game is still active
     */
    function isActive () {
        return active;
    };

    /**
     * Attempt to set a piece on the board
     * @param {Object} move The move to make, eg: {x : [1, 1]} for x in the middle
     * @return {Boolean} True on successful move, false if move is invalid
     */
    function move (move) {
        
        // trying to move out of turn.
        if (!(turn in move)) return false;
        
        var x = move[turn][0],
            y = move[turn][1],
            next,
            push = {};

        if (state[x][y] !== '') return false;

        push[turn] = [x, y];
        history.push(push);

        state[x][y] = turn;
        next = check();

        fire('move', state);
        if (next) turnChange();

        return true;

    };

    /**
     * Attach a listener to a custom event
     * @param {String} e The name of the event
     * @param {Function} fn The function to call when the event is fired
     */
    function on (e, fn) {
        events[e] = fn;
    };

    /**
     * Sets the game's state
     * @param {Array} s The game state (an array of arrays of positions)
     */
    function setState (s) {
        state = s;
    };

    /**
     * Toggle the turn between "x" and "o"
     */
    function turnChange () {
        turn = ((turn == 'x') ? 'o' : 'x');
        fire('turn', turn);
    };
    
    return {
        check : check,
        getMoves : getMoves,
        getTurn : getTurn,
        getWinner : getWinner,
        getState : getState,
        setState : setState,
        getHistory : getHistory,
        init : init,
        isActive : isActive,
        move : move,
        on : on
    };

};
