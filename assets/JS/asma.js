let url = new URL(window.location.href);
let searchParams = url.searchParams;
let pathname = url.search.slice(2);

const wrapperAsma = document.querySelector(".wrapper-asma");
const sort = document.querySelector(".sort");
fecthAsma();

const toTop = document.querySelector(".toTop");

toTop.addEventListener("click", () => {
  window.scrollTo(0, 0);
});

document.addEventListener("scroll", function () {
  const scrollposition = window.scrollY;

  if (scrollposition >= window.innerHeight * 0.01) {
    toTop.classList.add("active");
  } else {
    toTop.classList.remove("active");
  }
});

const loading = document.querySelector(".loading");

async function fecthAsma() {
  try {
    const [res1, res2] = await Promise.all([
      fetch("https://asmaul-husna-api.vercel.app/api/all"),
      fetch("https://api.myquran.com/v2/husna/semua"),
    ]);

    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

    if (data1 && data2) {
      const combinedData = data1.data.map((asma, index) => ({
        urutan: asma.urutan,
        latin: asma.latin,
        arti: asma.arti,
        arab: data2.data[index].arab,
      }));

      let wrap = "";

      combinedData.forEach((husna) => {
        wrap += templateAsma(husna.urutan, husna.arab, husna.latin, husna.arti);
      });

      wrapperAsma.innerHTML = wrap;

      search(combinedData);
      sorts(combinedData);
      getbyURL(combinedData);
      loading.style.display = "none";
    }
    hidePreloader();
  } catch (error) {
    console.log(error);
  }
}

const inputsearch = document.getElementById("search-input");

function search(fetchData) {
  if (pathname) {
    inputsearch.value = pathname;
  }

  inputsearch.addEventListener("input", function (e) {
    const keyword = inputsearch.value.trim().toLowerCase().split(" ");

    wrapperAsma.innerHTML = "";
    let list = "";

    fetchData.forEach((data) => {
      const splitarti = data.arti.split(" ").join("");
      const splitlatin = data.latin.split(" ").join("");
      const nomor = data.urutan.toString();

      const match = keyword.every((keyword) => {
        const arti = splitarti.toLowerCase().includes(keyword);
        const latin = splitlatin.toLowerCase().includes(keyword);
        const no = nomor.startsWith(keyword);

        return arti || latin || no;
      });

      if (match) {
        let mark = data.arti;

        keyword.forEach((word) => {
          mark = mark
            .toLowerCase()
            .split(word)
            .join(
              `<span style="background:var(--clr-primary-100)" ">${word}</span>`
            );

          return mark;
        });

        list += templateAsma(data.urutan, data.arab, data.latin, mark);
      }

      wrapperAsma.innerHTML = list;
    });
    if (wrapperAsma.innerHTML === "") {
      wrapperAsma.innerHTML = `<h3 class="noData ml-auto w-100 fs-secondary-heading text-center p-block-200">Hasil Pencarian Tidak Ditemukan...</h3>`;
    }
  });
}

inputsearch.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});

function getbyURL(fetchData) {
  if (pathname) {
    const match = fetchData.filter((data) => {
      return pathname == data.urutan;
    });

    const [{ urutan, arab, arti, latin }] = match;

    const list = templateAsma(urutan, arab, latin, arti);

    wrapperAsma.innerHTML = list;
  }
}

function sorts(datas) {
  sort.addEventListener("click", function () {
    const iconSort = document.querySelector(".icon-sort");

    if (iconSort.classList.contains("ph-arrow-up")) {
      iconSort.classList.remove("ph-arrow-up");
      iconSort.classList.add("ph-arrow-down");
    } else {
      iconSort.classList.add("ph-arrow-up");
      iconSort.classList.remove("ph-arrow-down");
    }

    const data = datas.reverse();
    let list = "";

    data.forEach((husna) => {
      list += templateAsma(husna.urutan, husna.arab, husna.latin, husna.arti);
    });

    wrapperAsma.innerHTML = list;
  });
}

const notification = document.querySelector(".notification");
let timeoutId;

window.addEventListener("click", function (e) {
  if (e.target.classList.contains("copy")) {
    const card = e.target.parentElement;

    const arab = card.querySelector(".text-arabic").textContent;
    const latin = card.querySelector(".text-latin").textContent;
    const arti = card.querySelector(".arti").textContent;

    const text = `                        ${arab} \n${latin}\n${arti}`;

    navigator.clipboard.writeText(text);

    clearTimeout(timeoutId);

    // Set timeout baru
    timeoutId = setTimeout(() => {
      notification.classList.remove("show");
    }, 1000);

    notification.classList.add("show");
  }
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

function templateAsma(id, arab, indo, arti) {
  return ` <div class="card bg-neutral-100">
  <span class="material-symbols-outlined copy">
content_copy
</span>
              <div class="top-contensikadsa">
                <div class="text-arabic">${arab}</div>
              </div>

              <div class="bottom-conteaskmdkask">
                <div
                  class="d-flex"
                  style="--jc: start; --ac: center; --gap: 0.2rem"
                >
                  <span class="nomor fw-semi-bold fs-125">${id}.</span>
                  <p class="text-latin fw-semi-bold fs-125">${indo}</p>
                </div>
                <p class="arti fw-reguler">${arti}</p>
              </div>
            </div>`;
}
