// טיסות יוצאות
// 2019:
// 6,749
// 2020:
// 620
 
// נוסעים שהמריאו מישראל
// 2019:
// 1,032,707
// 2020:
// 3,986
 
// טיסות נכנסות
// 2019:
// 6,740
// 2020:
// 605
 
// נוסעים שנחתו בישראל
// 2019:
// 999,726
// 2020:
// 5,427

function circleStats() {
  // console.log('circling');

  // const comparisonLabels = [ 'אפריל 2019', 'אפריל 2020', ];
  const baseR = 6.5;
  const baseGap = 12;
  const circleColors = [ '#acd2ed', '#fac53f', ];
  let renderSizes = [
    // [ radius, gap, ]
    [ baseR, baseGap, ],
    [ baseR, baseGap, ],
    [ baseR, baseGap, ],
    [ baseR, baseGap, ],
  ];
  const comparisonData = [
    {
      idx: 0,
      category: 'outboundFlights',
      label: 'טיסות יוצאות',
      circleValue: 100,
      data: [ 6749, 620, ],
    },
    {
      idx: 1,
      category: 'outboundPassengers',
      label: 'נוסעים שהמריאו מישראל',
      circleValue: 4000,
      data: [ 1032707, 3968, ],
    },
    {
      idx: 2,
      category: 'inboundFlights',
      label: 'טיסות נכנסות',
      circleValue: 100,
      data: [ 6740, 605, ],
    },
    {
      idx: 3,
      category: 'inboundPassengers',
      label: 'נוסעים שנחתו בישראל',
      circleValue: 5500,
      data: [ 999726, 5427, ],
    },
  ];

  const dims = { width: 0, height: 0, paddingSides: 24, paddingBottom: 24, }
  const container = document.querySelector('.circle-comaprison-container');
  const chartContainer = container.querySelector('.circle-comparison-chart');
  const monthAndYear = container.querySelector('.circle-comaprison-month-and-year');

  const transitionDuration = data => data != null ? 1000 : 300; // milliseconds

  const svg = d3.select('.circle-comparison-chart').append('svg')
    .attr('width', 351)
    .attr('height', '50vh');
  const circleGroup = svg.append('g');

  let prevCircleCount = 0;
  let activeDataCategory = null;
  let activeColumn = null;

  const scaleX = d3
    .scaleLinear()

  updateDimensions();

  function getRenderData(dataEntry, column) {
    if (dataEntry == null || column == null) {
      return {
        r: baseR,
        gap: baseGap,
        circleCount: 0,
      };
    }

    const figure = dataEntry.data[column];
    const circleCount = Math.ceil(figure / dataEntry.circleValue);
    const [ r, gap, ] = renderSizes[dataEntry.idx];

    return {
      r,
      gap,
      circleCount,
    };
  }

  function updateCircles() {
    if (activeColumn != null) {
      monthAndYear.dataset.col = `${activeColumn}`;
    }

    const dataEntry = activeDataCategory
      ? comparisonData.find(d => d.category === activeDataCategory)
      : null;
    const { r, gap, circleCount, } = getRenderData(dataEntry, activeColumn);
    const rowLength = Math.floor((dims.width + gap) / (r * 2 + gap));
  
    const transitionBeat = Math.min(transitionDuration(dataEntry) / Math.max(prevCircleCount, circleCount), 30);
    const updateTransitionStart = Math.max(prevCircleCount - circleCount, 0) * transitionBeat;
  
    prevCircleCount = circleCount;

    scaleX
      .domain([ 0, rowLength - 1, ])
      .range([ dims.width - r, r ]);

    const circles = circleGroup
      .selectAll('circle')
      .data(Array(circleCount).fill());

    circles
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('cx', (_, i) => scaleX(i % rowLength))
      .attr('cy', (_, i) => r + (r * 2 + gap) * Math.floor(i / rowLength))
      .attr('r', 0)
      .attr('stroke-width', 0)
      .attr('fill', circleColors[activeColumn])
      .transition()
          .delay((_, i) => i * transitionBeat)
          .attr('r', r);

    circles
        .exit()
        .transition()
        .delay((_, i, { length, }) => (length - i - 1) * transitionBeat)
        .attr('r', 0)
        .remove();

    const updateSelection = circles
      .attr('cx', (_, i) => scaleX(i % rowLength))
      .attr('cy', (_, i) => r + (r * 2 + gap) * Math.floor(i / rowLength))
      .transition()
        .delay((_, i, { length, }) => updateTransitionStart && updateTransitionStart + (length - i) * 100)
        .attr('fill', circleColors[activeColumn]);
    
    if (updateTransitionStart) {
      updateSelection
          .attr('r', r * 1.2)
          .transition()
            .attr('r', r)
    }
    else {
      updateSelection.attr('r', r);
    }
  }
  
  function updateDimensions() {
    dims.width = chartContainer.clientWidth - dims.paddingSides; 
    dims.height = Math.floor(
      document.documentElement.clientHeight - (monthAndYear.offsetTop + monthAndYear.offsetHeight + 12) - dims.paddingBottom
    );

    svg
      .attr('width', dims.width)
      .attr('height', dims.height);

    updateRenderSizes();
    // if (activeColumn && activeDataCategory) {
    //   updateCircles();
    // }
  }

  function updateRenderSizes() {
    const { width, height, } = dims;
    renderSizes = comparisonData.map(({ data, circleValue, }, i) => {
      const highFigure = Math.ceil((Array.isArray(data) ? Math.max(...data) : 0) / circleValue);
      const maxSliceWidth = width / highFigure;
      const maxSliceArea = maxSliceWidth * height;
      const squareSide = Math.sqrt(maxSliceArea);

      if (squareSide < baseR * 2 + baseGap) {
        const quarter = Math.max(squareSide / 4, 3);
        return [ quarter, quarter * 1.5, ];
      }

      return [ baseR, baseGap, ];
    })
  }

  const observer = new IntersectionObserver(entries => {
    let intersectingMarker = null;
    let shouldCleanCircles = false;

    entries.forEach(entry => {
      const marker = entry.target;
      if (entry.isIntersecting
        && (activeColumn !== +marker.dataset.col || activeDataCategory !== marker.dataset.cat)
      ) {
        intersectingMarker = marker;
      }
      else if (activeColumn != null) {
        shouldCleanCircles = true;
      }
    });

    if (intersectingMarker) {
      activeColumn = +intersectingMarker.dataset.col;
      activeDataCategory = intersectingMarker.dataset.cat;

      container.classList.add('circle-comaprison-container--active');
      updateCircles();
    }

    else if (shouldCleanCircles) {
      activeColumn = null;
      activeDataCategory = null;
      container.classList.remove('circle-comaprison-container--active');
      updateCircles()
    }
  });

  const markers = document.querySelectorAll('.circle-comparison-subcat');

  markers.forEach(marker => {
    observer.observe(marker);
  });

  window.addEventListener('resize', updateDimensions);
};
 