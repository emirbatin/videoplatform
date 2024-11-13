
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
}

module.exports = generateSlug;
