const apiKey = "AIzaSyARZdmQK1j1TN9Q1VFfkAjJV6OqlUxZjjw";
const baseUrl = `https://www.googleapis.com/youtube/v3`;

const searchBtn = document.querySelector(".header___search > img");
const searchInput = document.querySelector(".header___search > input");

const mobSearchBtn = document.querySelector(".mob_search-div");
const moblogo = document.querySelector(".header-left");
const searchBar = document.querySelector(".header-middle");
const searchBarinput = document.querySelector(".header___search");

searchBtn.addEventListener("click", () => {
    let searchString = searchInput.value.trim();
    getSearchResults(searchString);
})

let ismobSearchOpen = false;
mobSearchBtn.addEventListener("click", () => {
    if (ismobSearchOpen === true) {
        searchBar.style.display = "none";
        moblogo.style.display = "flex";
        ismobSearchOpen = false;
    } else {
        searchBar.style.display = "flex";
        moblogo.style.display = "none";
        ismobSearchOpen = true;
    }
})



function getSearchStringFromLocalStorage() {
    return localStorage.getItem('searchString');
  }

  // Function to handle search on the first page
  function handleSearchOnFirstPage() {
    let searchString = getSearchStringFromLocalStorage();
    if (searchString != null) {
      // Remove the search string from local storage after retrieving it
      localStorage.removeItem('searchString');
      getSearchResults(searchString);
    } else{
        let initialVideoString = "Must Watch Investing Tips"
        getSearchResults(initialVideoString.trim());
    }
  }

  handleSearchOnFirstPage();



let headerItems = document.querySelectorAll(".header__item");

headerItems.forEach((item) => {
    item.addEventListener("click", () => {
        getSearchResults(item.textContent);
    })
})

let videoGrid = document.getElementById("video-grid");

/*
@param {String} searchString
*/





async function getSearchResults(searchString) {
    try {
        let url = `${baseUrl}/search?key=${apiKey}&q=${searchString}&part=snippet&maxResults=20`
        const response = await fetch(url, {
            method: "GET"
        });
        const result = await response.json();
        createVideoCard(result.items);
    } catch (data) {
        console.log(data)
    }
}


function clearData() {
    videoGrid.innerHTML = "";
}


async function createVideoCard(videoList) {
    clearData();
    videoList.forEach((singleVideo) => {

        const {
            snippet
        } = singleVideo;



        // Grabbing the details of single video
        let videoId = singleVideo.id.videoId;
        async function fetchVideoDetails(videoId) {
            let vdetails;
            try {
                let url = `${baseUrl}/videos?key=${apiKey}&part=snippet,contentDetails,statistics&id=${videoId}`
                let response = await fetch(url);
                vdetails = await response.json();
            } catch (data) {
                console.log(data)
            }
            // console.log(vdetails);

            let channelId = snippet.channelId;

            async function getChannelDetails(channelId) {
                try {
                    let url = `${baseUrl}/channels?key=${apiKey}&part=snippet,contentDetails,statistics&id=${channelId}`
                    let response = await fetch(url);
                    let details = await response.json();
                    return details;
                } catch (data) {
                    console.log(data)
                }
            }

            try {let channelDetails = await getChannelDetails(channelId);

            appendUi(channelDetails, vdetails, videoId);
                }catch (data) {
                    console.log(data)
                }
        }

        fetchVideoDetails(videoId);

        function appendUi(channelDetails, vdetails, videoId) {
            let uploadDate
            try {uploadDate = vdetails.items[0].snippet.publishedAt;
               } catch (data) {
                console.log(data);
               }

            function timeAgo(dateString) {
                const date = new Date(dateString);
                const currentDate = new Date();
                const timeDifference = currentDate - date;
                const seconds = Math.floor(timeDifference / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);
                const weeks = Math.floor(days / 7);
                const months = Math.floor(days / 30);
                const years = Math.floor(days / 365);

                if (seconds < 60) {
                    return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
                } else if (minutes < 60) {
                    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
                } else if (hours < 24) {
                    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
                } else if (days < 7) {
                    return days === 1 ? '1 day ago' : `${days} days ago`;
                } else if (weeks < 4) {
                    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
                } else if (months < 12) {
                    return months === 1 ? '1 month ago' : `${months} months ago`;
                } else {
                    return years === 1 ? '1 year ago' : `${years} years ago`;
                }
            }

            const humanReadableDate = timeAgo(uploadDate);
            const viewCount = formatViewCount(vdetails.items[0]?.statistics.viewCount);

            function formatViewCount(viewCount) {
                if (viewCount >= 1000000) {
                  return `${Math.floor(viewCount / 1000000)}M •`;
                } else if (viewCount >= 1000) {
                  return `${Math.floor(viewCount / 1000)}k •`;
                } else {
                  return viewCount.toString();
                }
              }

            let videoCard = document.createElement("div");
            videoCard.classList.add("video-card");
            let innerHtmlCard = `<div class="video-thumnail">
                                      <img src="${vdetails.items[0].snippet.thumbnails.high.url}" alt="Thumbnail" />
                                  </div>
                                  <div class="video-short-details">
                                      <div class="channel-logo">
                                      <img src="${channelDetails.items[0].snippet.thumbnails.default.url}" alt="channel logo" />
                                      </div>
                                      <div class="short-details">
                                      <div>
                                        <p class="video-title">
                                        ${vdetails.items[0].snippet.title}.
                                        </p>
                                      </div>
                                      <div class="video-details2">
                                          <p class="channel-name">${vdetails.items[0].snippet.channelTitle}</p>
                                          <div class="video-views-upload">
                                          <p class="views">${viewCount}</p>
                                          <p class="upload-date">${humanReadableDate}</p>
                                          </div>
                                      </div>
                                      </div>
                                  </div>`

            videoCard.innerHTML = innerHtmlCard;
            const newPageUrl = `vdetails.html`;
            videoCard.addEventListener("click", function () {
                sessionStorage.setItem('videoId', `${videoId}`);
                // Navigate to the new HTML page when the video card is clicked
                window.location.href = newPageUrl;
            });
            videoGrid.appendChild(videoCard);
        }
        
    })

}