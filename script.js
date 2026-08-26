"use strict";


/* =========================================
   GOOGLE APPS SCRIPT API
========================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyWqoJO_4qoYfFxNshOdd-jtIBfahASiaTmwD7POE56bCu0fBlnKdDpTuwwQPjUq6gOZg/exec";


/* =========================================
   ELEMENT
========================================= */

const pagesContainer =
    document.getElementById("pages");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("errorBox");

const errorMessage =
    document.getElementById("errorMessage");

const retryButton =
    document.getElementById("retryButton");

const backButton =
    document.getElementById("backButton");

const logoutButton =
    document.getElementById("logoutButton");

const readerStatus =
    document.getElementById("readerStatus");

const pageCounter =
    document.getElementById("pageCounter");


/* =========================================
   DATA
========================================= */

let readerData = null;

let pages = [];


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeReader
);


/* =========================================
   INITIALIZE READER
========================================= */

function initializeReader() {

    showLoading();

    hideError();


    /*
     * Ambil data login dari localStorage.
     *
     * Kita mendukung beberapa kemungkinan
     * nama penyimpanan agar kompatibel dengan
     * sistem login yang sudah ada.
     */

    const savedData =
        localStorage.getItem(
            "novelReaderData"
        );


    if (!savedData) {

        showError(
            "Data login tidak ditemukan. Silakan login terlebih dahulu."
        );

        return;

    }


    try {

        const loginData =
            JSON.parse(savedData);


        /*
         * Pastikan username tersedia.
         */

        const username =
            loginData.username ||
            loginData.userName ||
            loginData.user ||
            "";


        /*
         * Pastikan password tersedia.
         */

        const password =
            loginData.password ||
            loginData.pass ||
            "";


        if (!username) {

            showError(
                "Username tidak ditemukan. Silakan login kembali."
            );

            return;

        }


        if (!password) {

            showError(
                "Password tidak ditemukan. Silakan login kembali."
            );

            return;

        }


        /*
         * Panggil Google Apps Script.
         */

        loadReaderFromAPI(
            username,
            password
        );


    } catch (error) {

        console.error(
            "Data login rusak:",
            error
        );


        showError(
            "Data login tidak valid. Silakan login kembali."
        );

    }

}


/* =========================================
   LOAD READER FROM API
========================================= */

async function loadReaderFromAPI(
    username,
    password
) {

    try {

        /*
         * Encode username dan password
         * agar aman digunakan sebagai URL.
         */

        const url =
            API_URL +
            "?username=" +
            encodeURIComponent(username) +
            "&password=" +
            encodeURIComponent(password);


        console.log(
            "Memanggil Reader API..."
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "Response API:",
            data
        );


        /*
         * Periksa success.
         */

        if (data.success !== true) {

            throw new Error(
                data.message ||
                "Login API gagal."
            );

        }


        /*
         * Pastikan files tersedia.
         */

        if (
            !Array.isArray(
                data.files
            )
        ) {

            throw new Error(
                "Daftar WebP tidak ditemukan dari API."
            );

        }


        /*
         * Simpan data Reader.
         */

        readerData =
            data;


        /*
         * Urutkan halaman.
         */

        pages =
            sortPages(
                data.files
            );


        if (pages.length === 0) {

            throw new Error(
                "Folder Drive tidak memiliki file WebP."
            );

        }


        /*
         * Update tampilan.
         */

        updateHeader();

        renderPages();


        console.log(
            "Reader berhasil dimuat:",
            pages.length,
            "halaman"
        );

    } catch (error) {

        console.error(
            "Reader API Error:",
            error
        );


        showError(
            "Gagal memuat Reader: " +
            error.message
        );

    }

}


/* =========================================
   SORT PAGE
========================================= */

function sortPages(files) {

    return [...files].sort(
        function(a, b) {

            const numberA =
                getPageNumber(
                    a.name
                );


            const numberB =
                getPageNumber(
                    b.name
                );


            return numberA - numberB;

        }
    );

}


/* =========================================
   GET PAGE NUMBER
========================================= */

function getPageNumber(
    filename
) {

    if (!filename) {

        return 0;

    }


    /*
     * Contoh:
     *
     * page-0256.webp
     *
     * menjadi:
     *
     * 256
     */

    const match =
        filename.match(
            /(\d+)(?=\.[^.]+$)/
        );


    if (!match) {

        return 0;

    }


    return parseInt(
        match[1],
        10
    );

}


/* =========================================
   HEADER
========================================= */

function updateHeader() {

    const username =
        readerData.username ||
        "";


    readerStatus.textContent =
        username
            ? "Pembaca: " + username
            : pages.length + " halaman";


    pageCounter.textContent =
        "1 / " +
        pages.length;

}


/* =========================================
   RENDER PAGES
========================================= */

function renderPages() {

    hideLoading();

    hideError();


    pagesContainer.innerHTML =
        "";


    pages.forEach(
        function(file, index) {

            createPage(
                file,
                index
            );

        }
    );


    updatePageCounter();


    /*
     * Scroll ke halaman pertama.
     */

    window.scrollTo(
        0,
        0
    );

}


/* =========================================
   CREATE PAGE
========================================= */

function createPage(
    file,
    index
) {

    const page =
        document.createElement(
            "div"
        );


    page.className =
        "page";


    page.dataset.page =
        index + 1;


    const img =
        document.createElement(
            "img"
        );


    /*
     * URL WebP dari Apps Script.
     */

    img.src =
        file.url;


    img.alt =
        file.name ||
        "Halaman " +
        (index + 1);


    /*
     * Tiga halaman pertama
     * dimuat langsung.
     */

    img.loading =
        index < 3
            ? "eager"
            : "lazy";


    img.decoding =
        "async";


    /*
     * Tambahkan title.
     */

    img.title =
        file.name ||
        "";


    /*
     * Jika gambar berhasil dimuat.
     */

    img.onload =
        function() {

            console.log(
                "Loaded:",
                file.name
            );

        };


    /*
     * Jika gambar gagal dimuat.
     */

    img.onerror =
        function() {

            console.error(
                "Gagal memuat gambar:",
                file.name,
                file.url
            );


            img.style.display =
                "none";


            const error =
                document.createElement(
                    "div"
                );


            error.className =
                "page-error";


            error.style.padding =
                "40px 20px";


            error.style.textAlign =
                "center";


            error.style.color =
                "#aaa";


            error.textContent =
                "Gagal memuat " +
                file.name;


            page.appendChild(
                error
            );

        };


    page.appendChild(
        img
    );


    pagesContainer.appendChild(
        page
    );

}


/* =========================================
   PAGE COUNTER
========================================= */

function updatePageCounter() {

    if (!pages.length) {

        return;

    }


    const pageElements =
        document.querySelectorAll(
            ".page"
        );


    const viewportCenter =
        window.innerHeight / 2;


    let currentPage =
        1;


    let smallestDistance =
        Infinity;


    pageElements.forEach(
        function(
            page,
            index
        ) {

            const rect =
                page.getBoundingClientRect();


            const pageCenter =
                rect.top +
                rect.height / 2;


            const distance =
                Math.abs(
                    pageCenter -
                    viewportCenter
                );


            if (
                distance <
                smallestDistance
            ) {

                smallestDistance =
                    distance;


                currentPage =
                    index + 1;

            }

        }
    );


    pageCounter.textContent =
        currentPage +
        " / " +
        pages.length;

}


/* =========================================
   SCROLL
========================================= */

let scrollTimer =
    null;


window.addEventListener(
    "scroll",
    function() {

        if (scrollTimer) {

            return;

        }


        scrollTimer =
            requestAnimationFrame(
                function() {

                    updatePageCounter();

                    scrollTimer =
                        null;

                }
            );

    },
    {
        passive: true
    }
);


/* =========================================
   BACK
========================================= */

backButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "https://novelrinuxant.github.io/login/";

    }
);


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
    "click",
    function() {

        localStorage.removeItem(
            "novelReaderData"
        );


        window.location.href =
            "https://novelrinuxant.github.io/login/";

    }
);


/* =========================================
   RETRY
========================================= */

retryButton.addEventListener(
    "click",
    function() {

        initializeReader();

    }
);


/* =========================================
   LOADING
========================================= */

function showLoading() {

    loading.style.display =
        "";

}


function hideLoading() {

    loading.style.display =
        "none";

}


/* =========================================
   ERROR
========================================= */

function showError(
    message
) {

    hideLoading();


    pagesContainer.innerHTML =
        "";


    errorMessage.textContent =
        message;


    errorBox.hidden =
        false;

}


function hideError() {

    errorBox.hidden =
        true;

}
