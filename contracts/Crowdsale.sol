// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.18;

import "./Token.sol";

contract Crowdsale {
    Token public token;

    // Need code and address from token.sol file

    constructor(Token _token) {
        token = _token;
    }
}



