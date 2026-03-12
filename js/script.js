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
			<span><strong style="color: #fff;">${playing}</strong> playing</span>
			<span><strong style="color: #fff;">${formatNumber(visits)}</strong> visits</span>
			<span><strong style="color: #fff;">${formatNumber(favorites)}</strong> favorites</span>
		`;
	}

	function showError() {
		const container = document.getElementById('aq-stats');
		if (container) {
			container.innerHTML = '<span style="color: #888;">Stats unavailable</span>';
		}
	}

	async function fetchStats() {
		try {
			const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${AQUATICA_UNIVERSE_ID}`);
			const data = await response.json();

			if (data.data && data.data.length > 0) {
				const game = data.data[0];
				renderStats(
					game.playing || 0,
					game.visits || 0,
					game.favoritedCount || 0
				);
			} else {
				showError();
			}
		} catch (error) {
			console.error('Failed to fetch live stats:', error);
			showLocalDevMessage();
		}
	}

	function showLocalDevMessage() {
		const container = document.getElementById('aq-stats');
		if (container) {
			container.innerHTML = `
				<span style="color: #888;"><strong style="color: #00d9ff;">Live stats</strong> available on production site</span>
			`;
		}
	}

	// Fetch on page load
	if (document.getElementById('aq-stats')) {
		fetchStats();
		setInterval(fetchStats, UPDATE_INTERVAL);
	}
})();
