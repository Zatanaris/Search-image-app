const Apikey = "QLdqiKUsfew0WoB3Wb9P1mTSKSSRWctzm95yGR81a6EXdygFGomQp4wE";

//* Selectors

const searchForm = document.getElementById("search-form");
const searchResult = document.getElementById("result");

let sentinelObserve;

//* event listeners

const setupListeners = () => {
    searchForm.addEventListener("submit", onSearchFormSubmit);
};

//* event handlers

const onSearchFormSubmit = (e) => {
    e.preventDefault();

    const query = searchForm.query.value.trim();

    if (!query) {
        alert("please provide a valide search term");
        return;
    }

    const apiUrl = `https://api.pexels.com/v1/search?query=${query}&orientation=landscape`;

    ShowLoading();

    fetchApiImage(apiUrl)
        .then((data) => DisplayResults(data))
        .finally(HideLoading);
};

//* render function

const DisplayResults = (data) => {
    console.log(data);

    removeObserver();

    if (data.total_results === 0) {
        searchResult.innerHTML = `<div class="no-result">No images fould</div>`;
        return;
    }

    if (data.page === 1) {
        searchResult.innerHTML = "";
    }

    data.photos.forEach((photo) => {
        searchResult.innerHTML += `
        <div class="column-item">
            <a href="${photo.url}" target="_blank">
                <img
                    src="${photo.src.medium}"
                    alt="${photo.alt}"
                />
                <div class="image-content">
                    <h3 class="phothography">${photo.photographer}</h3>
                </div>
            </a>
        </div>
        
        `;
    });

    createObserver(data.next_page);
};

const ShowLoading = () => {
    const div = document.createElement("div");
    div.classList.add("loader");

    document.body.prepend(div);
};

const HideLoading = () => {
    const loader = document.querySelector(".loader");
    loader && loader.remove();
};

const createObserver = (nextPageUrl) => {
    if (!nextPageUrl) return;

    //create the element to be observed

    const sentinel = document.createElement("div");

    sentinel.id = "sentinel";

    //append the element at the end of the image grid

    document.querySelector(".content").appendChild(sentinel);

    //initialize the intersection observed

    sentinelObserve = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                loaderMoreResults(nextPageUrl);
            }
        });
    });

    //conect the element to the observer

    sentinelObserve.observe(sentinel);
};

const removeObserver = () => {
    //remove the observed element
    const sentinel = document.getElementById("sentinel");
    sentinel && sentinel.remove();

    //disconect the observer
    if (sentinelObserve) {
        sentinelObserve.disconnect();
        sentinelObserve = null;
    }
};

//* helper function

const fetchApiImage = async (apiURL) => {
    try {
        const response = await fetch(apiURL, {
            headers: { Authorization: Apikey },
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! status=${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.log("fetch error", error);
    }
};

const loaderMoreResults = (nextpage) => {
    ShowLoading();

    fetchApiImage(nextpage)
        .then((data) => DisplayResults(data))
        .finally(HideLoading);
};

//* initialize

setupListeners();
