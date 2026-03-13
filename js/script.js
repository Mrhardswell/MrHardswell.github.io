/* Count to a specific number */
function count(els) {
	els.each(function () {
		$(this)
			.prop('Counter', 0)
			.animate(
				{
					Counter: $(this).text(),
				},
				{
					duration: 3000,
					easing: 'swing',
					step: function (now) {
						$(this).text(Math.ceil(now));
					},
				}
			);
	});
}
/* Count when the counter section is in viewport */
const counterEls = $('.counter .counter__count');
new Waypoint({
	element: counterEls,

	handler: function () {
		count(counterEls);

		this.destroy();
	},

	offset: 'bottom-in-view',
});

/* Make navbar fixed when scrolled down and hide it when scrolled up */
const navbar = $('.navbar-top');
let previousScroll = 0;
$(window).on('scroll', function (event) {
	let currentScroll = $(window).scrollTop(); //Distance scrolled down the page
	let navHeight = $(navbar).height(); //Height of navbar
	if (currentScroll > 10) {
		$('.navbar-top').addClass('navbar-top--scrolled');
	} else {
		$('.navbar-top').removeClass('navbar-top--scrolled');
	}

	//When scrolling down AND you've scrolled past navHeight * 2.25, add .scrollUp
	if (currentScroll > previousScroll && currentScroll > navHeight * 2.25) {
		$(navbar).addClass('scrollUp');
		//When scrolling up AND you've scrolled less than navHeight, remove .scrollUp
	} else if (previousScroll > currentScroll && !(currentScroll <= navHeight)) {
		$(navbar).removeClass('scrollUp');
	}
	previousScroll = currentScroll;
});

/* Add navbar background color when it is not collapsed */
$('#navbarTopCollapsible').on('show.bs.collapse', function () {
	$('.navbar-top').addClass('bg-dark-trans');
});
$('#navbarTopCollapsible').on('hide.bs.collapse', function () {
	$('.navbar-top').removeClass('bg-dark-trans');
});

/* Live Game Stats Updater for Aquatica Observatory */
(function() {
	const AQUATICA_UNIVERSE_ID = 6657534906;
	const UPDATE_INTERVAL = 60000; // 60 seconds

	function formatNumber(num) {
		if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
		if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
		return num.toString();
	}

	function renderStats(playing, visits, favorites) {
		const container = document.getElementById('aq-stats');
		if (!container) return;

		container.innerHTML = `
			<div class="stat-item">
				<span class="stat-value">${playing}</span>
				<span class="stat-label">playing</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">${formatNumber(visits)}</span>
				<span class="stat-label">visits</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">${formatNumber(favorites)}</span>
				<span class="stat-label">favorites</span>
			</div>
		`;
		container.classList.add('loaded');
	}

	function showLoading() {
		const container = document.getElementById('aq-stats');
		if (!container) return;

		container.innerHTML = `
			<div class="stat-loading">
				<div class="loading-dots">
					<span></span>
					<span></span>
					<span></span>
				</div>
				<span class="loading-text">Fetching live stats</span>
			</div>
		`;
	}

	function showErrorWithRetry() {
		const container = document.getElementById('aq-stats');
		if (!container) return;

		container.innerHTML = `
			<div class="stat-offline">
				<svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/>
				</svg>
				<span class="offline-text">Live stats unavailable offline</span>
				<a href="https://www.roblox.com/games/78959878729166/Aquatica-Observatory" 
				   target="_blank" class="stat-link">
					View on Roblox →
				</a>
			</div>
		`;
		container.classList.add('error');
	}

	async function fetchStats() {
		showLoading();
		
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
			
			const response = await fetch(
				`https://games.roblox.com/v1/games?universeIds=${AQUATICA_UNIVERSE_ID}`,
				{ 
					signal: controller.signal,
					headers: { 'Accept': 'application/json' }
				}
			);
			
			clearTimeout(timeoutId);

			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			
			const data = await response.json();

			if (data.data && data.data.length > 0) {
				const game = data.data[0];
				renderStats(
					game.playing || 0,
					game.visits || 0,
					game.favoritedCount || 0
				);
			} else {
				throw new Error('No data');
			}
		} catch (error) {
			console.log('Stats fetch failed:', error.message);
			showErrorWithRetry();
		}
	}

	// Initialize if element exists
	if (document.getElementById('aq-stats')) {
		fetchStats();
		// Retry every 60 seconds
		setInterval(fetchStats, UPDATE_INTERVAL);
	}
})();
