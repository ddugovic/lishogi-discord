function formatName(firstName, lastName) {
    if (firstName && lastName)
        return `${firstName} ${lastName}`;
    return firstName ?? lastName;
}

function formatNickname(firstName, lastName) {
    return firstName ?? lastName;
}

module.exports = { formatName, formatNickname };
