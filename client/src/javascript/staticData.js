module.exports = {
    tagIcons: [
        "unrealengine",
        "haskell",
        "csharp",
        "css",
        "html",
        "android",
        "nodejs",
        "ionic",
        "angular",
        "stylus",
        "django",
        "java",
        "javascript",
        "nuxt",
        "swift",
        "perl",
        "firebase",
        "typescript",
        "less",
        "python",
        "react",
        "vue",
        "webassembly",
        "go",
        "ruby",
        "rust",
        "graphql",
        "sass",
        "c++",
        "handlebars",
        "godot",
        "unity",
        "flash",
        "kotlin"
    ],
    backupTagIcons: [
        "unrealengine",
        "haskell",
        "csharp",
        "css",
        "html",
        "android",
        "nodejs",
        "ionic",
        "angular",
        "stylus",
        "django",
        "java",
        "javascript",
        "nuxt",
        "swift",
        "perl",
        "firebase",
        "typescript",
        "less",
        "python",
        "react",
        "vue",
        "webassembly",
        "go",
        "ruby",
        "rust",
        "graphql",
        "sass",
        "c++",
        "handlebars",
        "godot",
        "unity",
        "flash",
        "kotlin"
    ],
    capitalizeString(string) {
        let upped = string.charAt(0).toUpperCase() + string.slice(1);
        return upped
    },
    lowercaseTags(tags) {
        let lowercasedTags = []

        tags.forEach((tag) => {
            tag = tag.toLowerCase()
            lowercasedTags.push(tag)
        })

        return lowercasedTags
    },
    capitalizeTags(tags) {
        let capitalizedTags = []
        tags.forEach((tag) => {
          let capitalized = this.capitalizeString(tag)
  
          capitalizedTags.push(capitalized)
        })

        return capitalizedTags
    },
    returnTagIcon(tag) {
        tag = tag.toLowerCase()

        // console.log(this.tagIcons.length)

        if (this.tagIcons.includes(tag)) {
            return require('@/assets/langs/'+ tag +'.svg')
        }

        return require('@/assets/langs/custom.svg')
    }
}