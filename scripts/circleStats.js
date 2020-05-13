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

  const comparisonLabels = [ 'אפריל 2019', 'אפריל 2020', ]
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
  ];

  const r = 7;

  const container = d3.select('.circle-comparison-chart');
  const svg = container.append('svg')
    .attr('width', 351)
    .attr('height', '50vh');
  const circleGroup = svg.append('g');

  const circleCount = Math.ceil(6749 / 100);
  const dataArray = Array(circleCount).fill();

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

  function updateCircles(category, column) {
    const dataEntry = comparisonData.find(d => d.category === category);
    const figure = dataEntry.data[column];

    const circleCount = Math.ceil(figure / dataEntry.circleValue);
    const dataArray = Array(circleCount).fill();

    const circles = circleGroup
      .selectAll('circle')
      .data(dataArray);

    circles
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', 'hotpink')
      //   .attr('cx', (d, i) => r + (r * 2 + 12) * (i % 14))
      .attr('cx', (d, i) => scaleX(i % 14))
      .attr('cy', (d, i) => r + (r * 2 + 12) * Math.floor(i / 14))
      .attr('r', 0)
      .attr('stroke-width', 0)
      .attr('fill', 'hotpink')
      .transition()
          .delay((d, i) => i * 30)
          .attr('r', r);

    circles
        .exit()
        .transition()
        .delay((d, i, { length, }) => {
          console.log('******* d', {d, delay: (length - i - 1) * 30})
          return (length - i - 1) * 30;
        })
        .attr('r', 0)
        .remove();

    circles
        .transition()
        .attr('r', r)
        .attr('fill', 'tomato');
  }
    


  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        console.log('**** entry', entry);
        if (entry.isIntersecting) {
          const category = entry.target.dataset.cat;
          const column = +entry.target.dataset.col;
          console.log('****', { category, column, });
          updateCircles(category, column);
        }
      });
  });

  const markers = document.querySelectorAll('.circle-comparison-subcat');

  markers.forEach(marker => {
      observer.observe(marker);
  })
};
 