// Dados dos Campings
var CAMPINGS_DATA = [
  {
    name: "Fazenda Evaristo",
    city: "Rio Negrinho - SC",
    lat: -26.2575,
    lng: -49.7525,
    description:
      "Ponto de partida oficial! Estrutura impecável para famílias e pet friendly.",
    pet: true,
    cozinha: true,
    energia: true,
    highlight: true,
    instagram:
      "https://www.instagram.com/stories/highlights/18336223939258908/"
  },
  {
    name: "Bushcamping Rancho Queimado",
    city: "Rancho Queimado - SC",
    lat: -27.6713,
    lng: -49.0218,
    description:
      "Próxima aventura! Experiência selvagem e imersão total na natureza da serra.",
    pet: true,
    cozinha: true,
    energia: true,
    highlight: true,
    instagram: "https://www.instagram.com/letsgo_camping_sc/"
  }
];

var mapInstance = null;
var activeMarkers = [];


/* =========================================================
   FUNÇÃO AUXILIAR
   ========================================================= */

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   1. MAPA LEAFLET
   ========================================================= */

function initCampingMap() {
  var mapElement = document.getElementById("map");

  if (!mapElement || typeof L === "undefined") {
    return;
  }

  if (!CAMPINGS_DATA.length) {
    return;
  }

  var initialPoint = CAMPINGS_DATA[0];

  mapInstance = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: false,
    minZoom: 6,
    maxZoom: 18
  }).setView(
    [initialPoint.lat, initialPoint.lng],
    9
  );

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "Esri World Street Map"
    }
  ).addTo(mapInstance);

  renderFilteredMarkers("all");
  bindMapFilters();

  setTimeout(function () {
    if (mapInstance) {
      mapInstance.invalidateSize();
    }
  }, 300);

  window.addEventListener("resize", function () {
    if (mapInstance) {
      mapInstance.invalidateSize();
    }
  });
}


function renderFilteredMarkers(filter) {
  if (!mapInstance) {
    return;
  }

  // Remove os marcadores existentes
  activeMarkers.forEach(function (marker) {
    mapInstance.removeLayer(marker);
  });

  activeMarkers = [];

  // Ícone personalizado
  var tentIcon = L.divIcon({
    className: "custom-tent-marker-wrapper",

    html:
      '<div class="custom-tent-marker">' +
        '<span style="font-size: 28px;">⛺</span>' +
      "</div>",

    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22]
  });

  // Filtragem
  var filteredData = CAMPINGS_DATA.filter(function (camping) {

    if (filter === "pet") {
      return camping.pet;
    }

    if (filter === "cozinha") {
      return camping.cozinha;
    }

    if (filter === "energia") {
      return camping.energia;
    }

    return true;
  });

  // Criação dos marcadores
  filteredData.forEach(function (camping) {

    var marker = L.marker(
      [camping.lat, camping.lng],
      {
        icon: tentIcon
      }
    ).addTo(mapInstance);

    var instagramButton = "";

    if (camping.instagram) {
      instagramButton =
        '<a href="' +
        escapeHtml(camping.instagram) +
        '" target="_blank" rel="noopener noreferrer" ' +
        'style="display:inline-block;margin-top:10px;font-weight:600;">' +
        "Ver Destaque ↗" +
        "</a>";
    }

    var popupHtml =
      '<div class="camping-popup">' +

        "<h3>" +
          escapeHtml(camping.name) +
        "</h3>" +

        '<div class="camping-city">' +
          escapeHtml(camping.city) +
        "</div>" +

        "<p>" +
          escapeHtml(camping.description) +
        "</p>" +

        instagramButton +

      "</div>";

    marker.bindPopup(popupHtml);

    // Abre automaticamente o destaque
    if (
      camping.highlight &&
      filter === "all"
    ) {
      marker.openPopup();
    }

    activeMarkers.push(marker);
  });

  // Atualiza contador
  var campingsCount =
    document.getElementById("campingsCount");

  if (campingsCount) {
    campingsCount.textContent =
      filteredData.length + "+";
  }
}


function bindMapFilters() {
  var filterBtns =
    document.querySelectorAll(".filter-btn");

  filterBtns.forEach(function (btn) {

    btn.addEventListener("click", function () {

      filterBtns.forEach(function (b) {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      var filterType =
        btn.getAttribute("data-filter") || "all";

      renderFilteredMarkers(filterType);
    });
  });
}


/* =========================================================
   2. NAVEGAÇÃO
   ========================================================= */

function initNavigation() {

  var navLinks =
    document.querySelectorAll(
      ".desktop-nav a, .trip-dock-v105 a"
    );

  navLinks.forEach(function (link) {

    link.addEventListener("click", function (e) {

      var targetId =
        link.getAttribute("href");

      if (
        targetId &&
        targetId.indexOf("#") === 0
      ) {

        var targetSection =
          document.querySelector(targetId);

        if (targetSection) {

          e.preventDefault();

          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }
    });
  });
}


/* =========================================================
   3. CALCULADORA
   ========================================================= */

function initCalculator() {

  var adultosInput =
    document.getElementById("calcAdultos");

  var criancasInput =
    document.getElementById("calcCriancas");

  var diasInput =
    document.getElementById("calcDias");


  var resAgua =
    document.getElementById("resAgua");

  var resComida =
    document.getElementById("resComida");

  var resCarvao =
    document.getElementById("resCarvao");

  var resPao =
    document.getElementById("resPao");


  function calculate() {

    if (
      !adultosInput ||
      !criancasInput ||
      !diasInput
    ) {
      return;
    }

    var adultos = Math.max(
      1,
      parseInt(adultosInput.value, 10) || 1
    );

    var criancas = Math.max(
      0,
      parseInt(criancasInput.value, 10) || 0
    );

    var dias = Math.max(
      1,
      parseInt(diasInput.value, 10) || 1
    );


    // Criança equivale a 0,5 pessoa para consumo
    var totalPessoas =
      adultos + criancas * 0.5;


    var aguaLitros =
      Math.round(
        totalPessoas * 3 * dias
      );

    var carneKg =
      (
        totalPessoas *
        0.4 *
        dias
      ).toFixed(1);

    var carvaoKg =
      Math.round(dias * 2);

    var paesTotal =
      Math.round(
        (adultos + criancas) * dias
      );


    if (resAgua) {
      resAgua.textContent =
        aguaLitros + "L";
    }

    if (resComida) {
      resComida.textContent =
        carneKg + "kg";
    }

    if (resCarvao) {
      resCarvao.textContent =
        carvaoKg + "kg";
    }

    if (resPao) {
      resPao.textContent =
        paesTotal;
    }
  }


  [
    adultosInput,
    criancasInput,
    diasInput
  ].forEach(function (input) {

    if (input) {

      input.addEventListener(
        "input",
        calculate
      );

      input.addEventListener(
        "change",
        calculate
      );
    }
  });


  calculate();
}


/* =========================================================
   4. CHECKLIST E PDF
   ========================================================= */

function initChecklist() {

  var progressBar =
    document.getElementById(
      "checklistProgress"
    );

  var statusText =
    document.getElementById(
      "checklistStatus"
    );

  var btnExportPDF =
    document.getElementById(
      "btnExportPDF"
    );


  function updateProgress() {

    var checkboxes =
      document.querySelectorAll(
        ".chk-item"
      );

    var checked =
      document.querySelectorAll(
        ".chk-item:checked"
      ).length;

    var total =
      checkboxes.length;


    var percentage =
      total > 0
        ? Math.round(
            (checked / total) * 100
          )
        : 0;


    if (progressBar) {

      progressBar.style.width =
        percentage + "%";
    }


    if (statusText) {

      statusText.textContent =
        percentage +
        "% concluído (" +
        checked +
        " de " +
        total +
        " itens)";
    }
  }


  function bindCheckboxEvents() {

    var checkboxes =
      document.querySelectorAll(
        ".chk-item"
      );


    checkboxes.forEach(
      function (checkbox, index) {

        var savedState =
          sessionStorage.getItem(
            "chk_state_" + index
          );


        if (savedState === "true") {
          checkbox.checked = true;
        }


        // Usa onchange para evitar
        // múltiplos listeners
        checkbox.onchange =
          function () {

            sessionStorage.setItem(
              "chk_state_" + index,
              String(
                checkbox.checked
              )
            );

            updateProgress();
          };
      }
    );


    updateProgress();
  }


  function saveCustomItems() {

    var customItemsData = [];


    document
      .querySelectorAll(
        ".checklist-group"
      )
      .forEach(function (group) {

        var category =
          group.getAttribute(
            "data-category"
          );


        group
          .querySelectorAll(
            ".check-item.custom-item span"
          )
          .forEach(function (span) {

            customItemsData.push({
              category: category,
              text: span.textContent
            });
          });
      });


    sessionStorage.setItem(
      "custom_checklist_items",
      JSON.stringify(
        customItemsData
      )
    );
  }


  function createNewItem(
    container,
    text
  ) {

    if (
      !container ||
      !text
    ) {
      return;
    }


    var label =
      document.createElement(
        "label"
      );

    label.className =
      "check-item custom-item";


    var input =
      document.createElement(
        "input"
      );

    input.type = "checkbox";
    input.className = "chk-item";


    var span =
      document.createElement(
        "span"
      );

    span.textContent = text;


    label.appendChild(input);
    label.appendChild(span);

    container.appendChild(label);


    bindCheckboxEvents();
  }


  function loadCustomItems() {

    var saved =
      sessionStorage.getItem(
        "custom_checklist_items"
      );


    if (!saved) {
      return;
    }


    try {

      var items =
        JSON.parse(saved);


      if (!Array.isArray(items)) {
        return;
      }


      items.forEach(
        function (item) {

          if (
            !item ||
            !item.category ||
            !item.text
          ) {
            return;
          }


          var groups =
            document.querySelectorAll(
              ".checklist-group"
            );


          var targetGroup = null;


          groups.forEach(
            function (group) {

              if (
                group.getAttribute(
                  "data-category"
                ) === item.category
              ) {
                targetGroup = group;
              }
            }
          );


          if (targetGroup) {

            var container =
              targetGroup.querySelector(
                ".items-list"
              );

            if (container) {

              createNewItem(
                container,
                item.text
              );
            }
          }
        }
      );

    } catch (e) {

      console.warn(
        "Não foi possível carregar os itens personalizados.",
        e
      );
    }
  }


  // Botões "Adicionar item"
  document
    .querySelectorAll(
      ".btn-add-item"
    )
    .forEach(function (btn) {

      btn.addEventListener(
        "click",
        function () {

          var parentBox =
            btn.closest(
              ".add-item-box"
            );


          if (!parentBox) {
            return;
          }


          var input =
            parentBox.querySelector(
              ".input-new-item"
            );


          var checklistGroup =
            parentBox.closest(
              ".checklist-group"
            );


          if (
            !input ||
            !checklistGroup
          ) {
            return;
          }


          var text =
            input.value.trim();


          var container =
            checklistGroup.querySelector(
              ".items-list"
            );


          if (
            text &&
            container
          ) {

            createNewItem(
              container,
              text
            );

            saveCustomItems();

            input.value = "";

            input.focus();
          }
        }
      );
    });


  /* =====================================================
     EXPORTAÇÃO PDF
     ===================================================== */

  if (btnExportPDF) {

    btnExportPDF.addEventListener(
      "click",
      function () {

        var printElement =
          document.getElementById(
            "checklistPrintArea"
          ) ||
          document.querySelector(
            ".checklist-card"
          );


        if (
          window.html2pdf &&
          printElement
        ) {

          var opt = {

            margin: [
              10,
              10,
              10,
              10
            ],

            filename:
              "letsgo_camping_checklist.pdf",

            image: {
              type: "jpeg",
              quality: 0.98
            },

            html2canvas: {
              scale: 2,
              useCORS: true,
              scrollY: 0
            },

            jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait"
            },

            pagebreak: {
              mode: [
                "avoid-all",
                "css"
              ]
            }
          };


          html2pdf()
            .set(opt)
            .from(printElement)
            .output("blob")
            .then(
              function (pdfBlob) {

                var blobUrl =
                  URL.createObjectURL(
                    pdfBlob
                  );


                var link =
                  document.createElement(
                    "a"
                  );


                link.href =
                  blobUrl;

                link.download =
                  "letsgo_camping_checklist.pdf";


                document.body.appendChild(
                  link
                );


                link.click();


                document.body.removeChild(
                  link
                );


                setTimeout(
                  function () {

                    URL.revokeObjectURL(
                      blobUrl
                    );

                  },
                  100
                );
              }
            )
            .catch(
              function (error) {

                console.error(
                  "Erro ao gerar PDF:",
                  error
                );

                window.print();
              }
            );

        } else {

          window.print();
        }
      }
    );
  }


  // Carrega itens personalizados
  loadCustomItems();

  // Inicializa checkboxes
  bindCheckboxEvents();
}


/* =========================================================
   5. WIDGET DE CLIMA
   ========================================================= */

function initWeatherWidget() {

  var selectCamping =
    document.getElementById(
      "selectCampingWeather"
    );

  var tempEl =
    document.getElementById(
      "weatherTemp"
    );

  var windEl =
    document.getElementById(
      "weatherWind"
    );

  var rainEl =
    document.getElementById(
      "weatherRain"
    );

  var statusEl =
    document.getElementById(
      "weatherStatus"
    );


  if (
    !selectCamping ||
    typeof CAMPINGS_DATA === "undefined" ||
    !CAMPINGS_DATA.length
  ) {
    return;
  }


  // Preenche o select
  selectCamping.innerHTML =
    CAMPINGS_DATA
      .map(function (
        camping,
        index
      ) {

        return (
          '<option value="' +
          index +
          '">' +
          escapeHtml(
            camping.name
          ) +
          " (" +
          escapeHtml(
            camping.city
          ) +
          ")" +
          "</option>"
        );
      })
      .join("");


  function fetchWeather(
    lat,
    lng
  ) {

    if (statusEl) {

      statusEl.textContent =
        "Atualizando previsão do tempo...";
    }


    var url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" +
      encodeURIComponent(lat) +
      "&longitude=" +
      encodeURIComponent(lng) +
      "&current_weather=true" +
      "&hourly=precipitation_probability" +
      "&timezone=auto";


    fetch(url)

      .then(function (response) {

        if (!response.ok) {

          throw new Error(
            "Erro HTTP " +
            response.status
          );
        }


        return response.json();
      })


      .then(function (data) {

        if (
          !data ||
          !data.current_weather
        ) {

          throw new Error(
            "Dados de clima indisponíveis."
          );
        }


        var temp =
          Math.round(
            data.current_weather
              .temperature
          );


        var wind =
          Math.round(
            data.current_weather
              .windspeed
          );


        var rainProb = 0;


        if (
          data.hourly &&
          Array.isArray(
            data.hourly
              .precipitation_probability
          ) &&
          data.hourly
            .precipitation_probability
            .length
        ) {

          rainProb =
            data.hourly
              .precipitation_probability[0] ||
            0;
        }


        if (tempEl) {

          tempEl.textContent =
            temp + "°C";
        }


        if (windEl) {

          windEl.textContent =
            wind + " km/h";
        }


        if (rainEl) {

          rainEl.textContent =
            rainProb + "%";
        }


        var dicaVento =
          wind > 25
            ? " ⚠️ Vento forte! Reforce os espeques da barraca."
            : " 🍃 Vento calmo para acampar.";


        if (statusEl) {

          statusEl.textContent =
            "Previsão atualizada com sucesso." +
            dicaVento;
        }
      })


      .catch(function (error) {

        console.error(
          "Erro ao carregar clima:",
          error
        );


        if (statusEl) {

          statusEl.textContent =
            "Não foi possível carregar o clima no momento.";
        }
      });
  }


  // Troca do camping
  selectCamping.addEventListener(
    "change",
    function (e) {

      var selectedCamping =
        CAMPINGS_DATA[
          e.target.value
        ];


      if (selectedCamping) {

        fetchWeather(
          selectedCamping.lat,
          selectedCamping.lng
        );
      }
    }
  );


  // Carrega o primeiro camping
  if (CAMPINGS_DATA.length > 0) {

    fetchWeather(
      CAMPINGS_DATA[0].lat,
      CAMPINGS_DATA[0].lng
    );
  }
}


/* =========================================================
   6. INICIALIZAÇÃO
   ========================================================= */

   document.addEventListener("DOMContentLoaded", function () {
    initCampingMap();
    initNavigation();
    initCalculator();
    initChecklist();
    initWeatherWidget();
    initCampingWhatsApp();
    initNtkAffiliate();
  });

/* =========================================================
   7. SOLICITAÇÃO DE INCLUSÃO DE CAMPING VIA WHATSAPP
   ========================================================= */

   function initCampingWhatsApp() {

    var btnWhatsApp = document.getElementById(
      "btnAddCampingWhatsApp"
    );
  
    if (!btnWhatsApp) {
      return;
    }
  
    // Substituir pelo número oficial do WhatsApp do canal.
    // Formato: 55 + DDD + número, somente dígitos.
    var whatsappNumber = "5548999388756";
  
    var message =
      "Olá! Gostaria de cadastrar meu camping na lista de previsão do tempo do Let’s Go Camping SC. 🏕️\n\n" +
      "Segue os dados para inclusão:\n\n" +
      "📍 Nome do camping:\n" +
      "🏙️ Cidade:\n" +
      "🗺️ Estado (UF):\n" +
      "📮 CEP:\n" +
      "📌 Endereço completo:\n\n" +
      "Obrigado!";
  
    var whatsappUrl =
      "https://wa.me/" +
      whatsappNumber +
      "?text=" +
      encodeURIComponent(message);
  
    btnWhatsApp.href = whatsappUrl;
  }