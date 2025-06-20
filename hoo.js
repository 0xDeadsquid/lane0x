  <script>
    document.addEventListener('DOMContentLoaded', function () {
      const modal = document.getElementById("token-modal");
      const fromTokenButton = document.getElementById("from-token-button");
      const toTokenButton = document.getElementById("to-token-button");
      const closeModalBtn = document.querySelector(".close-button");
      const tokenListEl = document.getElementById("token-list");
      const tokenSearchInput = document.getElementById("token-search-input");
      const networkFiltersEl = document.getElementById("network-filters");
      const switchTokensButton = document.getElementById("switch-tokens");

      let allTokens = [];
      let allNetworks = ['ALL', 'THOR', 'BTC', 'ETH', 'ARB', 'MAYA', 'BSC', 'AVAX', 'DOGE', 'DOT', 'KUJI', 'BCH', 'LTC', 'DASH', 'COSMOS', 'RADIX', 'SOL', 'XRP', 'BASE'];
      let networkIconMap = {};

      let currentTargetButton = null;
      let activeNetwork = 'ALL';
      let isLoading = false;
      let hasFetched = false;

      // Helper function to safely parse JSON responses
      async function safeFetchJson(url, fileName) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${fileName}! status: ${response.status}`);
          }
          let data = await response.json();
          if (!Array.isArray(data)) {
            if (typeof data === 'object' && data !== null && Object.keys(data).length > 0) {
              console.warn(`${fileName} was parsed as a single object, wrapping it in an array.`);
              return [data];
            } else {
              console.warn(`${fileName} did not return a valid array or a non-empty single object. Returning empty array.`);
              return [];
            }
          }
          return data;
        } catch (error) {
          console.error(`Error fetching or parsing ${fileName}:`, error);
          return [];
        }
      }

      // --- API Fetching and Processing ---
      async function fetchAndProcessTokens() {
        if (isLoading) return;

        isLoading = true;
        tokenListEl.innerHTML = '<p style="text-align:center;">Loading tokens...</p>';

        try {
          // Fetch top 250 tokens by market cap from CoinGecko
          const coingeckoResponse = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false');
          if (!coingeckoResponse.ok) throw new Error(`CoinGecko API error! status: ${coingeckoResponse.status}`);
          const coingeckoTokens = await coingeckoResponse.json();

          // Fetch local token lists using the helper
          const ercTokens = await safeFetchJson('/erc.json', 'erc.json');
          const bscTokens = await safeFetchJson('/bsc.json', 'bsc.json');
          const arbTokens = await safeFetchJson('/arb.json', 'arb.json');
          const xrdTokens = await safeFetchJson('/xrd.json', 'xrd.json');
          const solanaTokens = await safeFetchJson('/solana.json', 'solana.json');
          const solTokens = await safeFetchJson('/sol.json', 'sol.json');
          const solaTokens = await safeFetchJson('/sola.json', 'sola.json');
          const baseTokens = await safeFetchJson('/base.json', 'base.json');
          const avaxTokens = await safeFetchJson('/avax.json', 'avax.json');


          const mapCoinGeckoIdToNetwork = (id) => {
            const mapping = {
              'bitcoin': 'BTC',
              'ethereum': 'ETH',
              'binancecoin': 'BSC',
              'avalanche-2': 'AVAX',
              'dogecoin': 'DOGE',
              'polkadot': 'DOT',
              'cosmos': 'COSMOS',
              'litecoin': 'LTC',
              'bitcoin-cash': 'BCH',
              'dash': 'DASH',
              'solana': 'SOL',
              'ripple': 'XRP',
              'arbitrum': 'ARB',
              'radix': 'RADIX',
              'base': 'BASE',
              'tether': 'ETH',
              'usd-coin': 'ETH',
              'binance-usd': 'BSC',
              'chainlink': 'ETH',
              'uniswap': 'UNI',
              'wrapped-bitcoin': 'ETH',
              'shiba-inu': 'ETH',
              'dogelon-mars': 'ETH',
              'decentraland': 'ETH',
              'the-sandbox': 'ETH'
            };
            return mapping[id] || 'ETH';
          };

          let processedCoinGeckoTokens = coingeckoTokens.map(token => ({
            name: token.name,
            ticker: (token.symbol ? token.symbol.toUpperCase() : (token.id ? token.id.toUpperCase() : '')),
            network: mapCoinGeckoIdToNetwork(token.id),
            icon: token.image
          }));

          let processedErcTokens = ercTokens.map(token => ({
            name: token.name,
            ticker: (token.symbol ? token.symbol.toUpperCase() : (token.ticker ? token.ticker.toUpperCase() : '')),
            network: 'ETH',
            icon: token.logoURI
          }));

          let processedBscTokens = bscTokens.map(token => ({
            name: token.name,
            ticker: (token.symbol ? token.symbol.toUpperCase() : (token.ticker ? token.ticker.toUpperCase() : '')),
            network: 'BSC',
            icon: token.logoURI
          }));

          let processedArbTokens = arbTokens.map(token => ({
            name: token.name,
            ticker: (token.symbol ? token.symbol.toUpperCase() : (token.ticker ? token.ticker.toUpperCase() : '')),
            network: 'ARB',
            icon: token.logoURI
          }));

          let processedXrdTokens = xrdTokens.map(token => ({
            name: token.name,
            ticker: (token.ticker && token.ticker.length < 10 ? token.ticker.toUpperCase() : (token.symbol ? token.symbol.toUpperCase() : '')),
            network: 'RADIX',
            icon: token.logoURI
          }));

          let processedSolanaJsonTokens = solanaTokens.map(token => ({
            name: token.name,
            ticker: (token.symbol ? token.symbol.toUpperCase() : (token.name ? token.name.toUpperCase() : '')),
            network: 'SOL',
            icon: token.logoURI
          }));

          let processedSolJsonTokens = solTokens.map(token => ({
            name: token.name,
            ticker: (token.ticker ? token.ticker.toUpperCase() : (token.symbol ? token.symbol.toUpperCase() : (token.name ? token.name.toUpperCase() : ''))),
            network: 'SOL',
            icon: token.logoURI
          }));

          let processedSolaJsonTokens = solaTokens.map(token => ({
            name: token.name,
            ticker: (token.ticker ? token.ticker.toUpperCase() : (token.symbol ? token.symbol.toUpperCase() : (token.name ? token.name.toUpperCase() : ''))),
            network: 'SOL',
            icon: token.logoURI
          }));

          let processedBaseTokens = baseTokens.map(token => ({
            name: token.name,
            ticker: (token.symbol ? token.symbol.toUpperCase() : (token.name ? token.name.toUpperCase() : '')),
            network: 'BASE',
            icon: token.logoURI
          }));

          let processedAvaxTokens = avaxTokens.map(token => ({
            name: token.name,
            ticker: (token.symbol ? token.symbol.toUpperCase() : (token.name ? token.name.toUpperCase() : '')),
            network: 'AVAX',
            icon: token.logoURI || token.logo
          }));


          // Manual tokens with specific properties, including displayNetwork and priority
          // These are the ultimate source of truth for their specific ticker/network combinations.
          const manualTokens = [
            // Core native tokens and other prioritized ones that might not come from external lists
            // Note: Their position here affects overwrite precedence in the map, not display order (that's handled by sort).
            { name: 'RUNE', ticker: 'RUNE', icon: 'https://storage.googleapis.com/token-list-swapkit/images/thor.rune.png', network: 'THOR' },
            { name: 'TCY', ticker: 'TCY', icon: 'https://storage.googleapis.com/token-list-swapkit/images/thor.tcy.png', network: 'THOR' }, // Native TCY
            { name: 'ETH', ticker: 'ETH', icon: 'https://storage.googleapis.com/token-list-swapkit-dev/images/base.base.png', network: 'BASE'}, // Base ETH
            { name: 'XRD', ticker: 'XRD', icon: 'https://storage.googleapis.com/token-list-swapkit/images/xrd.xrd.png', network: 'RADIX'},
            { name: 'BTC', ticker: 'BTC', icon: 'https://storage.googleapis.com/token-list-swapkit/images/btc.btc.png', network: 'BTC' },
            { name: 'BNB', ticker: 'BNB', icon: 'https://storage.googleapis.com/token-list-swapkit/images/bnb.bnb.png', network: 'BSC' },
            { name: 'AVAX', ticker: 'AVAX', icon: 'https://storage.googleapis.com/token-list-swapkit/images/avax.avax.png', network: 'AVAX' },
            { name: 'DOGE', ticker: 'DOGE', icon: 'https://storage.googleapis.com/token-list-swapkit/images/doge.doge.png', network: 'DOGE' },
            { name: 'SOL', ticker: 'SOL', icon: 'https://storage.googleapis.com/token-list-swapkit/images/sol.sol.png', network: 'SOL' },
            { name: 'XRP', ticker: 'XRP', icon: 'https://storage.googleapis.com/token-list-swapkit/images/xrp.xrp.png', network: 'XRP' },
            { name: 'LTC', ticker: 'LTC', icon: 'https://storage.googleapis.com/token-list-swapkit/images/ltc.ltc.png', network: 'LTC' },
            { name: 'BCH', ticker: 'BCH', icon: 'https://storage.googleapis.com/token-list-swapkit/images/bch.bch.png', network: 'BCH' },
            { name: 'DASH', ticker: 'DASH', icon: 'https://storage.googleapis.com/token-list-swapkit/images/dash.dash.png', network: 'DASH' },
            { name: 'DOT', ticker: 'DOT', icon: 'https://storage.googleapis.com/token-list-swapkit/images/polkadot.dot.png', network: 'DOT' },
            { name: 'COSMOS', ticker: 'ATOM', icon: 'https://storage.googleapis.com/token-list-swapkit/images/cosmos.atom.png', network: 'COSMOS' },

            // Other manual tokens (e.g., CACAO, KUJI if not covered elsewhere)
            { name: 'CACAO', ticker: 'CACAO', icon: 'https://storage.googleapis.com/token-list-swapkit/images/maya.cacao.png', network: 'MAYA' },
            { name: 'KUJI', ticker: 'KUJI', icon: 'https://storage.googleapis.com/token-list-swapkit/images/kuji.kuji.png', network: 'KUJI' },

            // SYNTH Network Tokens (display under THOR filter, with 'SYNTH' label)
            // Note: `network` is 'THOR' for filtering, `displayNetwork` is 'SYNTH' for UI
            { name: 'AVAX', ticker: 'sAVAX', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://storage.googleapis.com/token-list-swapkit/images/avax.avax.png' },
            { name: 'BCH', ticker: 'sBCH', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://storage.googleapis.com/token-list-swapkit/images/bch.bch.png' },
            { name: 'BNB', ticker: 'sBNB', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://storage.googleapis.com/token-list-swapkit/images/bnb.bnb.png' },
            { name: 'DOGE', ticker: 'sDOGE', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://storage.googleapis.com/token-list-swapkit/images/doge.doge.png' },
            { name: 'ATOM', ticker: 'sATOM', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://storage.googleapis.com/token-list-swapkit/images/cosmos.atom.png' },
            { name: 'LTC', ticker: 'sLTC', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://storage.googleapis.com/token-list-swapkit/images/ltc.ltc.png' },
            { name: 'TCY', ticker: 'sTCY', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://storage.googleapis.com/token-list-swapkit/images/thor.tcy.png' },
            { name: 'XRP', ticker: 'sXRP', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://storage.googleapis.com/token-list-swapkit/images/xrp.xrp.png' },

            // Placeholders for less common SYNTH tokens on THORChain
            { name: 'UCK', ticker: 'UCK', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://via.placeholder.com/30?text=UCK' },
            { name: 'snoofi', ticker: 'SNOOFI', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://via.placeholder.com/30?text=SNOOFI' },
            { name: 'acc', ticker: 'ACC', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://via.placeholder.com/30?text=ACC' },
            { name: 'Limmy', ticker: 'LIMMY', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://via.placeholder.com/30?text=LIMMY' },
            { name: 'b', ticker: 'B', network: 'THOR', displayNetwork: 'SYNTH', icon: 'https://via.placeholder.com/30?text=B' }
          ];

          // Order of precedence for merging into finalTokenMap:
          // Lower priority first, higher priority overwrites/adds on top.
          // The Map preserves insertion order, so this defines the base ordering for `allTokens`.
          const finalTokenMap = new Map();

          // Add CoinGecko tokens (lowest priority)
          processedCoinGeckoTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));

          // Add local chain-specific tokens (medium priority, will override CoinGecko for duplicates)
          processedErcTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));
          processedBscTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));
          processedArbTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));
          processedXrdTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));
          processedSolanaJsonTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));
          processedSolJsonTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));
          processedSolaJsonTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));
          processedBaseTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));
          processedAvaxTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));

          // Add manual tokens (highest priority for overrides, will overwrite any previously added duplicates)
          manualTokens.forEach(token => finalTokenMap.set(`${token.ticker}-${token.network}`, token));

          // Convert map values to array for filtering and sorting
          allTokens = Array.from(finalTokenMap.values());


          // Custom Network Icon Overrides (This ensures filter button icons are correct)
          networkIconMap = {
            'THOR': 'https://storage.googleapis.com/token-list-swapkit/images/thor.rune.png',
            'BTC': 'https://storage.googleapis.com/token-list-swapkit/images/btc.btc.png',
            'ETH': 'https://storage.googleapis.com/token-list-swapkit/images/eth.eth.png', // Native ETH icon
            'BSC': 'https://storage.googleapis.com/token-list-swapkit/images/bnb.bnb.png',
            'ARB': 'https://storage.googleapis.com/token-list-swapkit/images/arb.arb.png',
            'RADIX': 'https://storage.googleapis.com/token-list-swapkit/images/xrd.xrd.png',
            'SOL': 'https://storage.googleapis.com/token-list-swapkit/images/sol.sol.png',
            'BASE': 'https://storage.googleapis.com/token-list-swapkit-dev/images/base.base.png', // Explicitly set Base icon
            'AVAX': 'https://storage.googleapis.com/token-list-swapkit/images/avax.avax.png',
          };

          // Fallback for networks not explicitly defined above, using the first token found from the final list
          allNetworks.forEach(network => {
            if (!networkIconMap[network]) {
                const firstAssetOnNetwork = allTokens.find(t => t.network === network);
                if (firstAssetOnNetwork) networkIconMap[network] = firstAssetOnNetwork.icon;
            }
          });

          hasFetched = true;

        } catch (error) {
          console.error("Failed to fetch tokens:", error);
          tokenListEl.innerHTML = '<p style="text-align:center; color: #ff2357;">Failed to load tokens. Please try again later.</p>';
        } finally {
          isLoading = false;
          filterAndRenderTokens(); // Initial render with correct sorting
        }
      }

      // --- Modal and UI Rendering ---
      function renderNetworkFilters() {
        networkFiltersEl.innerHTML = '';
        const orderlyNetworkOrder = ['ALL', 'THOR', 'BTC', 'ETH', 'ARB', 'MAYA', 'BSC', 'AVAX', 'DOGE', 'DOT', 'KUJI', 'BCH', 'LTC', 'DASH', 'COSMOS', 'RADIX', 'SOL', 'XRP', 'BASE'];

        orderlyNetworkOrder.forEach(network => {
          if (!allNetworks.includes(network) && network !== 'ALL') return;

          const btn = document.createElement('button');
          btn.classList.add('network-filter-btn');
          if (network === activeNetwork) {
            btn.classList.add('active');
          }
          btn.dataset.network = network;

          let iconHtml = '';
          if (network === 'THOR') {
            iconHtml = `<svg viewBox="0 0 24 24" fill="#5DD39B" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.1001L7.9 9.0001H11.9L12 4.9001V3.1001Z"></path><path d="M16.1 9.0001L12 3.1001V4.9001L11.9 9.0001H16.1Z"></path><path d="M7.9 9.0001L12 4.9001V13.1001L6.1 9.0001H7.9Z" ></path><path d="M11.9 9.0001L6.1 9.0001L9.8 20.3551L11.9 13.1001V9.0001Z" ></path><path d="M12.063 13.1317L9.95203 20.3552L13.804 15.1707L16.035 15.0647L12.063 13.1317Z"></path></svg>`;
          } else if (networkIconMap[network]) {
            iconHtml = `<img src="${networkIconMap[network]}" alt="${network}" onerror="this.style.display='none'">`;
          }

          if (network === 'ALL') {
            btn.textContent = 'ALL';
          } else {
            btn.innerHTML = `${iconHtml} <span>${network}</span>`;
          }

          btn.addEventListener('click', () => {
            activeNetwork = network;
            renderNetworkFilters();
            filterAndRenderTokens();
          });
          networkFiltersEl.appendChild(btn);
        });
      }

      function filterAndRenderTokens() {
        if (!hasFetched && !isLoading) {
          fetchAndProcessTokens();
          return;
        }

        if (isLoading) {
          tokenListEl.innerHTML = '<p style="text-align:center;">Loading tokens...</p>';
          return;
        }

        const searchTerm = tokenSearchInput.value.toLowerCase();
        let filteredTokens = allTokens; // Start with the full, compiled list

        // Helper to determine if a token is the primary "native" asset for a given network
        const isPrimaryNative = (token, network) => {
            if (network === 'BASE' && token.ticker === 'ETH' && token.network === 'BASE') return true;
            if (token.ticker === network && token.network === network) return true;
            return false;
        };

        if (activeNetwork !== 'ALL') {
          filteredTokens = allTokens.filter(token => token.network.toUpperCase() === activeNetwork.toUpperCase());

          filteredTokens.sort((a, b) => {
              // --- Network-specific sorting logic ---
              if (activeNetwork === 'THOR') {
                  const thorOrder = ['RUNE', 'TCY']; // Specific order for THOR's main tokens
                  const indexA_thor = thorOrder.indexOf(a.ticker);
                  const indexB_thor = thorOrder.indexOf(b.ticker);

                  // Prioritize RUNE and TCY at the very top of THOR's list
                  if (indexA_thor !== -1 && indexB_thor !== -1) {
                      return indexA_thor - indexB_thor;
                  }
                  if (indexA_thor !== -1) {
                      return -1;
                  }
                  if (indexB_thor !== -1) {
                      return 1;
                  }

                  // After RUNE/TCY, prioritize SYNTH tokens on THOR
                  const isASynth = a.displayNetwork === 'SYNTH';
                  const isBSynth = b.displayNetwork === 'SYNTH';

                  if (isASynth && !isBSynth) return -1; // SYNTH comes before other non-synth on THOR
                  if (!isASynth && isBSynth) return 1;

              } else { // For all other specific networks (including BASE)
                  const isANativeForActiveNetwork = isPrimaryNative(a, activeNetwork);
                  const isBNativeForActiveNetwork = isPrimaryNative(b, activeNetwork);

                  if (isANativeForActiveNetwork && !isBNativeForActiveNetwork) return -1; // Native token comes first
                  if (!isANativeForActiveNetwork && isBNativeForActiveNetwork) return 1;
              }

              // No default alphabetical sort here; maintain original insertion order if no rule applies
              return 0; // Crucial change: return 0 to maintain existing order
          });

        } else { // activeNetwork === 'ALL'
            filteredTokens.sort((a, b) => {
                // Priority 1: RUNE (THOR) then TCY (THOR) - ABSOLUTE TOP PRIORITY FOR 'ALL'
                const isARuneThor = (a.ticker === 'RUNE' && a.network === 'THOR');
                const isBTcyThor = (b.ticker === 'TCY' && b.network === 'THOR');
                const isATcyThor = (a.ticker === 'TCY' && a.network === 'THOR');
                const isBRuneThor = (b.ticker === 'RUNE' && b.network === 'THOR');

                // If both are RUNE/TCY from THOR, sort by their defined order
                if (isARuneThor && isBRuneThor) return 0;
                if (isARuneThor && isATcyThor) return -1; // RUNE before TCY
                if (isBRuneThor && isBTcyThor) return 1; // RUNE before TCY

                if (isARuneThor) return -1; // A is RUNE from THOR, comes first
                if (isBRuneThor) return 1; // B is RUNE from THOR, comes first

                if (isATcyThor) return -1; // A is TCY from THOR, comes first (after RUNE from THOR)
                if (isBTcyThor) return 1; // B is TCY from THOR, comes first

                // Priority 2: Other "native" coins (excluding RUNE/TCY which are already handled)
                const isANative = isPrimaryNative(a, a.network);
                const isBNative = isPrimaryNative(b, b.network);

                if (isANative && !isBNative) return -1;
                if (!isANative && isBNative) return 1;

                // Priority 3: SYNTH tokens (within THOR, for ALL view) - these should come after all natives
                const isASynth = a.displayNetwork === 'SYNTH';
                const isBSynth = b.displayNetwork === 'SYNTH';

                if (isASynth && !isBSynth) return 1; // Synthetics come after general natives, but before general tokens
                if (!isASynth && isBSynth) return -1;

                // For all other tokens, maintain their original relative order (effectively "random")
                return 0; // Crucial change: return 0 to maintain existing order
            });
        }

        if (searchTerm) {
          filteredTokens = filteredTokens.filter(token =>
            token.name.toLowerCase().includes(searchTerm) ||
            token.ticker.toLowerCase().includes(searchTerm)
          );
        }
        renderTokens(filteredTokens);
      }

      function renderTokens(tokensToRender) {
        tokenListEl.innerHTML = '';
        if (isLoading) {
          tokenListEl.innerHTML = '<p style="text-align:center;">Loading tokens...</p>';
          return;
        }
        if (!tokensToRender.length && hasFetched) {
          tokenListEl.innerHTML = '<p style="text-align:center;">No tokens found.</p>';
          return;
        }

        tokensToRender.forEach(token => {
          const tokenElement = document.createElement('div');
          tokenElement.classList.add('token-item');

          const displayNetworkText = token.displayNetwork || token.network;
          const displayNetworkClass = token.displayNetwork ? ' synth' : '';

          tokenElement.innerHTML = `
            <img src="${token.icon}" alt="${token.ticker}" onerror="this.style.display='none'; this.onerror=null;">
            <div class="token-info">
              <p class="token-ticker">${token.ticker}</p>
              <p class="token-network-display${displayNetworkClass}">${displayNetworkText}</p>
            </div>
          `;
          tokenElement.addEventListener('click', () => {
            selectToken(token);
          });
          tokenListEl.appendChild(tokenElement);
        });
      }

      async function openModal(targetButton) {
        currentTargetButton = targetButton;
        modal.style.display = "flex";

        activeNetwork = 'ALL'; // Reset to 'ALL' filter when opening the modal for consistent initial view
        tokenSearchInput.value = '';
        renderNetworkFilters(); // This will highlight ALL
        await fetchAndProcessTokens(); // Ensure tokens are fetched/re-fetched if needed, then it calls filterAndRenderTokens()
      }

      function selectToken(token) {
        if (currentTargetButton) {
          const img = currentTargetButton.querySelector('img');
          const tickerEl = currentTargetButton.querySelector('.css-ch9ou8');
          const nameEl = currentTargetButton.querySelector('.css-1pfetl3');

          // --- DEBUGGING LOGS ---
          console.log('Selected Token:', token);
          console.log('Attempting to set icon:', token.icon);
          // --- END DEBUGGING LOGS ---

          if(img && tickerEl && nameEl) {
              // Fallback for empty/null icon to a placeholder, in addition to onerror
              img.src = token.icon || 'https://via.placeholder.com/32?text=NA';
              img.alt = token.ticker;
              tickerEl.textContent = token.ticker;
              nameEl.textContent = token.displayNetwork || token.network;

              if (token.displayNetwork) {
                  nameEl.classList.add('synth');
              } else {
                  nameEl.classList.remove('synth');
              }
          }

          modal.style.display = "none";
        }
      }

      function swapTokens() {
        const fromImg = fromTokenButton.querySelector('img');
        const fromTickerEl = fromTokenButton.querySelector('.css-ch9ou8');
        const fromNetworkEl = fromTokenButton.querySelector('.css-1pfetl3');

        const toImg = toTokenButton.querySelector('img');
        const toTickerEl = toTokenButton.querySelector('.css-ch9ou8');
        const toNetworkEl = toTokenButton.querySelector('.css-1pfetl3');

        const fromButtonImgSrc = fromImg.src;
        const fromButtonImgAlt = fromImg.alt;
        const fromButtonTickerText = fromTickerEl.textContent;
        const fromButtonNetworkText = fromNetworkEl.textContent;
        const fromButtonHasSynthClass = fromNetworkEl.classList.contains('synth');


        const toButtonImgSrc = toImg.src;
        const toButtonImgAlt = toImg.alt;
        const toButtonTickerText = toTickerEl.textContent;
        const toButtonNetworkText = toNetworkEl.textContent;
        const toButtonHasSynthClass = toNetworkEl.classList.contains('synth');


        fromImg.src = toButtonImgSrc;
        fromImg.alt = toButtonImgAlt;
        fromTickerEl.textContent = toButtonTickerText;
        fromNetworkEl.textContent = toButtonNetworkText;
        if (toButtonHasSynthClass) {
            fromNetworkEl.classList.add('synth');
        } else {
            fromNetworkEl.classList.remove('synth');
        }

        toImg.src = fromButtonImgSrc;
        toImg.alt = fromButtonImgAlt;
        toTickerEl.textContent = fromButtonTickerText;
        toNetworkEl.textContent = fromButtonNetworkText;
        if (fromButtonHasSynthClass) {
            toNetworkEl.classList.add('synth');
        } else {
            toNetworkEl.classList.remove('synth');
        }
      }

      // --- Event Listeners ---
      tokenSearchInput.addEventListener('input', filterAndRenderTokens);
      fromTokenButton.addEventListener('click', () => openModal(fromTokenButton));
      toTokenButton.addEventListener('click', () => openModal(toTokenButton));
      switchTokensButton.addEventListener('click', swapTokens);
      closeModalBtn.addEventListener('click', () => modal.style.display = "none");

      window.addEventListener('click', function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      });

      const swapSettingsHeader = document.querySelector('#swap-settings .justify-between');
      if(swapSettingsHeader){
          const detailsContainer = swapSettingsHeader.nextElementSibling;
          const arrowIcon = swapSettingsHeader.querySelector('svg:last-of-type');

          swapSettingsHeader.addEventListener('click', () => {
              const isHidden = detailsContainer.style.maxHeight === '0px' || detailsContainer.style.maxHeight === '';
              if(isHidden){
                  detailsContainer.style.maxHeight = detailsContainer.scrollHeight + "px";
                  arrowIcon.style.transform = 'rotate(180deg)';
              } else {
                  detailsContainer.style.maxHeight = '0px';
                  arrowIcon.style.transform = 'rotate(0deg)';
              }
          });
      }

      renderNetworkFilters();
    });
</script>
