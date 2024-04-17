const url = new URL(window.location.href);
const param = url.searchParams;

let part;
if (param.size == 1) {
  const pathname = url.search.slice(1);
  const path = pathname.split("=");

  part = path[1].split("%20").join(" ");
}
const icon = document.querySelector(".icon-sumber");
const pilihSumber = document.querySelector(".pilih-sumber");

fetchDoa();
animateProgress();

pilihSumber.addEventListener("click", () => {
  if (icon.classList.contains("ph-caret-down")) {
    icon.classList.remove("ph-caret-down");
    icon.classList.add("ph-caret-up");
  } else {
    icon.classList.remove("ph-caret-up");
    icon.classList.add("ph-caret-down");
  }
});

document.addEventListener("scroll", () => {
  icon.classList.remove("ph-caret-up");
  icon.classList.add("ph-caret-down");
});

const wrapperdoa = document.querySelector(".wrapper-doa");

async function fetchDoa() {
  try {
    const response = await fetch(`https://api.dikiotang.com/doa`);

    if (response.ok) {
      const data = await response.json();
      const alldoa = data.data;

      if (alldoa) {
        semuasumber(alldoa);
        search(alldoa);
        selectOption(alldoa);
        getDataURL(alldoa);

        document.querySelector(".loading").style.display = "none";
      }

      hidePreloader();
    } else {
      console.log(erorr);
    }
  } catch (error) {
    console.log(error);
  }
}

function semuasumber(alldoa) {
  let list = "";

  alldoa.forEach((doa, i) => {
    list += templateDoa(i + 1, doa.judul, doa.arab, doa.indo);
  });

  wrapperdoa.innerHTML = list;
}

const sort = document.querySelector(".sort");
const iconsort = document.querySelector(".icon-sort");

sort.addEventListener("click", () => {
  if (iconsort.classList.contains("ph-arrow-up")) {
    iconsort.classList.remove("ph-arrow-up");
    iconsort.classList.add("ph-arrow-down");
    const dataSorted = [...wrapperdoa.children].sort((a, b) => {
      return b.getAttribute("data-index") - a.getAttribute("data-index");
    });

    dataSorted.forEach((data) => {
      wrapperdoa.appendChild(data);
    });
  } else {
    iconsort.classList.add("ph-arrow-up");
    iconsort.classList.remove("ph-arrow-down");
    const dataSorted = [...wrapperdoa.children].sort((a, b) => {
      return a.getAttribute("data-index") - b.getAttribute("data-index");
    });

    dataSorted.forEach((data) => {
      wrapperdoa.appendChild(data);
    });
  }
});

const inputsearch = document.getElementById("search-input");
if (param.size == 1) {
  inputsearch.value = part;
}
function search(alldoa) {
  inputsearch.addEventListener("input", function () {
    const keyword = inputsearch.value.trim().toLowerCase().split(" ");

    wrapperdoa.innerHTML = "";
    let list = "";

    alldoa.forEach((doa, i) => {
      const splitjudul = doa.judul.toLowerCase().trim().split(" ");

      const match = keyword.every((keyword) => {
        const judul = splitjudul.includes(keyword);

        console.log(doa);

        return judul;
      });

      if (match) {
        let indo = doa.indo;

        keyword.forEach((word) => {
          indo = indo
            .split(word)
            .join(
              `<span style="background:var(--clr-primary-100)">${word}</span>`
            );

          return indo;
        });

        list += templateDoa(i + 1, doa.judul, doa.arab, indo);
      }
      wrapperdoa.innerHTML = list;
    });

    if (wrapperdoa.innerHTML === "") {
      wrapperdoa.innerHTML = `<h2 class="fs-secondary-heading text-center p-top-100">Hasil Pencarian Tidak Ditemukan...</h2>`;
    }
  });

  inputsearch.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  });
}

function getDataURL(alldoa) {
  if (param.size == 1) {
    wrapperdoa.innerHTML = "";
    let list = "";

    const match = alldoa.filter((doa) => {
      const match = doa.judul === part;

      return match;
    });

    const [{ judul, arab, indo }] = match;

    list += templateDoa(1, judul, arab, indo);

    wrapperdoa.innerHTML = list;
  }
}

const pilihsumber = document.getElementById("pilih-sumber");

function selectOption(alldoa) {
  pilihSumber.addEventListener("click", function () {
    const keyword = pilihSumber.value;

    if (keyword === "semua") {
      semuasumber(alldoa);
    } else {
      wrapperdoa.innerHTML = "";

      let list = "";

      const sumber = alldoa.filter((doa) => doa.source === keyword);
      console.log(sumber);
      sumber.forEach((sumber, i) => {
        list += templateDoa(i + 1, sumber.judul, sumber.arab, sumber.indo);
      });

      wrapperdoa.innerHTML = list;
    }
  });
}
let hidden;
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("copy")) {
    const parent = e.target.parentElement.parentElement;
    const judul = parent.querySelector(".text-judul").textContent;
    const arab = parent.querySelector(".text-arab").textContent;
    const arti = parent.querySelector(".text-arti").textContent;

    const text = `${judul}
        ${arab} 
        ${arti}`;

    navigator.clipboard.writeText(text);

    const notif = document.querySelector(".notification");

    clearTimeout(hidden);

    hidden = setTimeout(() => {
      notif.classList.remove("show");
    }, 1500);

    notif.classList.add("show");
  }
});

const toTop = document.querySelector(".toTop");

document.addEventListener("scroll", () => {
  const scrollpostion = window.scrollY;

  if (scrollpostion > window.innerHeight * 0.01) {
    toTop.classList.add("active");
  } else {
    toTop.classList.remove("active");
  }
});

toTop.addEventListener("click", () => {
  window.scrollTo(0, 0);
});

function hidePreloader() {
  const progress = document.querySelector(".progress");
  progress.style.display = "none";
}
function animateProgress() {
  let i = 50;
  const progress = document.querySelector(".progress");

  const interval = setInterval(() => {
    i++;
    progress.textContent = `${i}%`;

    if (i === 100) {
      clearInterval(interval);
      hidePreloader();
    }
  }, 20); // Adjust the interval to control the speed of animation
}

function templateDoa(i, judul, arab, indo) {
  return `<li class="list" data-index="${i}">
              <div class="list-navigation">
                <p class="No fw-semi-bold ff-primary">${i}</p>
                <span class="material-symbols-outlined copy">
                  content_copy
                </span>
              </div>
              <div class="list-content">
                <h5 class="text-judul fw-semi-bold ff-primary">${judul}</h5>
                <h3 class="text-arab p-block-150">
                ${arab}
                </h3>
                <p class="text-arti fs-medium">${indo}</p>
              </div>
            </li>`;
}
