function fetchHtml(url) {
    return fetch(`/api/proxy?contentType=text&url=${url}`)
        .then(res => res.text())
}

function extractText(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    let parsed = new Readability(doc).parse()
    if (!parsed || !parsed.textContent) {
        return ''
    }

    return parsed.textContent
}

function calculateWords(str) {
    str = str.replace(/http[^ ]*/g, '')
    str = str.replace(/[().,?!"']/g, '')
    str = str.replace(/\//g, ' ')
    str = str.replace('\n', ' ')
    str = str.replace(/\s{2,}/g, ' ')
    str = str.trim().toLowerCase()

    const res1 = {}

    str.split(' ').forEach((word, i, words) => {
        res1[word] = (res1[word] + 1 || 1)
    })

    const res2 = Object.keys(res1).map(word => [word, res1[word]])
    res2.sort((a, b) => {
        return b[1] - a[1]
    })

    return res2
}

window.onload = async function () {
    const urlInput = document.getElementById('url')
    const goBtn = document.getElementById('go_btn')
    const resultsDiv = document.getElementById('results')

    goBtn.addEventListener('click', async () => {
        const html = await fetchHtml(urlInput.value)
        const articleText = extractText(html)
        const wordsTuples = calculateWords(articleText)

        console.log(wordsTuples)

        resultsDiv.innerHTML = ''
        wordsTuples.forEach((tuple, i) => {
            resultsDiv.innerHTML += `<p>${i + 1}: ${tuple[0]} - ${tuple[1]}</p>`
        })
    })
}
