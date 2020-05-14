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
  console.log('circling');

  const comparisonLabels = [ 'אפריל 2019', 'אפריל 2020', ];
  const circleColors = [ '#acd2ed', '#fac53f', ]
  const comparisonData = [
    {
      category: 'outboundFlights',
      label: 'טיסות יוצאות',
      circleValue: 100,
      data: [ 6749, 620, ],
    },
    {
      category: 'outboundPassengers',
      label: 'נוסעים שהמריאו מישראל',
      circleValue: 4000,
      data: [ 1032707, 3968, ],
    },
    {
      category: 'inboundFlights',
      label: 'טיסות נכנסות',
      circleValue: 100,
      data: [ 6740, 605, ],
    },
    {
      category: 'inboundPassengers',
      label: 'נוסעים שנחתו בישראל',
      circleValue: 5500,
      data: [ 999726, 5427, ],
    },
    {
      category: 'none',
      label: 'none',
      circleValue: 1,
      data: { 'null': 0, },
    },
  ];

  const container = document.querySelector('.circle-comaprison-container');
  const monthAndYear = container.querySelector('.circle-comaprison-month-and-year');

  const r = 7;
  // const transitionDuration = 1000; // milliseconds
  const transitionDuration = column => column != null ? 1000 : 300; // milliseconds

  const svg = d3.select('.circle-comparison-chart').append('svg')
    .attr('width', 351)
    .attr('height', '50vh');
  const circleGroup = svg.append('g');

  let prevCircleCount = 0;
  // const dataArray = Array(circleCount).fill();

  // scales
  const scaleX = d3
    .scaleLinear()
    .domain([ 0, 13, ])
    .range([ 351 - r, r ]);
  
//   const scaleY = d3
//     .scaleBand()
//     .domain([ 0, 800, ])
//     .range([ 7.5, 600 - 7.5, ]);

  // draw
//   const circles = circleGroup
//     .selectAll('circle')
//     .data(dataArray);

//   circles
//     .enter()
//     .append('circle')
//       .attr('r', 10)
//       .attr('fill', 'hotpink')
//     //   .attr('cx', (d, i) => r + (r * 2 + 12) * (i % 14))
//       .attr('cx', (d, i) => scaleX(i % 14))
//       .attr('cy', (d, i) => r + (r * 2 + 12) * Math.floor(i / 14))
//       .attr('r', 0)
//       .attr('stroke-width', 0)
//       .attr('fill', 'hotpink')
//       .transition()
//         .delay((d, i) => i * 30)
//         .attr('r', r);

//   circles
//     .exit()
//     .transition()
//       .delay((d, i) => (dataArray.length - i - 1) * 30)
//       .attr('r', 0)
//       .remove();

//   circles
//     .transition()
//       .attr('fill', 'tomato');

  function updateCircles(column = null, category = 'none') {
    if (column != null) {
      monthAndYear.dataset.col = `${column}`;
    }

    const dataEntry = comparisonData.find(d => d.category === category);
    const figure = dataEntry.data[column];

    const circleCount = Math.ceil(figure / dataEntry.circleValue);
    const transitionBeat = Math.min(transitionDuration(column) / Math.max(prevCircleCount, circleCount), 30);
    const updateTransitionStart = Math.max(prevCircleCount - circleCount, 0) * transitionBeat
    console.log('*** length', {circleCount, 'prevCircleCount - circleCount': prevCircleCount - circleCount});
    prevCircleCount = circleCount

    const circles = circleGroup
      .selectAll('circle')
      .data(Array(circleCount).fill());

    circles
      .enter()
      .append('circle')
      .attr('r', 10)
      // .attr('fill', 'hotpink')
      //   .attr('cx', (d, i) => r + (r * 2 + 12) * (i % 14))
      .attr('cx', (d, i) => scaleX(i % 14))
      .attr('cy', (d, i) => r + (r * 2 + 12) * Math.floor(i / 14))
      .attr('r', 0)
      .attr('stroke-width', 0)
      .attr('fill', circleColors[column])
      .transition()
          .delay((d, i) => i * transitionBeat)
          .attr('r', r);

    circles
        .exit()
        .transition()
        .delay((d, i, { length, }) => {
          // console.log('******* d', {d, length})
          return (length - i - 1) * transitionBeat;
        })
        .attr('r', 0)
        .remove();

    const updateSelection = circles
      .transition()
        // .duration(700)
        // .delay((d, i, { length, }) => updateTransitionStart && updateTransitionStart + (length - i) * transitionBeat*4)
        .delay((d, i, { length, }) => updateTransitionStart && updateTransitionStart + (length - i) * 100)
        .attr('fill', circleColors[column]);
    
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
    


  let activeColumn = null; 
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      console.log('**** entry', entry);
      const marker = entry.target;
      if (entry.isIntersecting) {
        const category = marker.dataset.cat;
        const column = +marker.dataset.col;
        console.log('****', { category, column, });
        container.classList.add('circle-comaprison-container--active');

        activeColumn = column;
        updateCircles(column, category);
      }
      else if (activeColumn != null) {
        if (
          (entry.boundingClientRect.top < 0 && marker.dataset.col === '1')
          || entry.boundingClientRect.top > 0 && marker.dataset.col === '0'
        ) {
          container.classList.remove('circle-comaprison-container--active');
          updateCircles(null)
        }
      }
    });
  });

  const markers = document.querySelectorAll('.circle-comparison-subcat');

  markers.forEach(marker => {
    observer.observe(marker);
  })
};
 