import React, { Component } from 'react';
import { geoPath, geoGraticule, geoAzimuthalEqualArea } from 'd3-geo';
import { rotateSph } from '../../logic/sphere';
import styled from 'styled-components';

class SchmidtNet extends Component {
  constructor(props) {
    super(props);
    this.createSchmidtNet = this.createSchmidtNet.bind(this);
    this.getPlaneCoordinates = this.getPlaneCoordinates.bind(this);
    this.svg = React.createRef();
    this.state = { width: 0, height: 0 };
    this.updateDimensions = this.updateDimensions.bind(this);
  }
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
    //const clientRect = this.svg.current.getBoundingClientRect();
    //this.setState({ width: clientRect.width, height: clientRect.height });
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }
  updateDimensions() {
    const clientRect = this.svg.current.getBoundingClientRect();
    this.setState({ width: clientRect.width, height: clientRect.height });
  }
  createSchmidtNet() {
    const geojson = { type: 'Sphere' };
    const pad = 20; //padding
    var projection = geoAzimuthalEqualArea()
      .precision(0.1)
      .clipAngle(90)
      .fitExtent(
        [[pad, pad], [this.state.width - pad, this.state.height - pad]],
        geojson
      );
    return geoPath().projection(projection);
  }
  getPlaneCoordinates() {
    const az = this.props.azimuth,
      dip = this.props.dip,
      e1 = [0, 0],
      aux1 = [90, 0],
      aux2 = rotateSph(aux1, e1, 270 - az),
      aux2Right = rotateSph(aux2, e1, -90),
      aux2Left = rotateSph(aux2, e1, 90),
      e2 = aux2Right,
      p = rotateSph(aux2, e2, dip),
      pole = rotateSph(p, e2, 90);
    return {
      plane: [
        [...aux2Right].reverse(),
        [...p].reverse(),
        [...aux2Left].reverse()
      ],
      pole: pole.reverse()
    };
  }
  getPlaneFromCoordinates() {}
  render() {
    const path = this.createSchmidtNet();
    const planeCoordinates = this.getPlaneCoordinates();
    return (
      <Wrapper className={this.props.className}>
        <svg
          className="svg"
          style={{ height: '100%', width: '100%' }}
          ref={this.svg}
        >
          <defs />
          <SpherePath
            style={{ height: '100%', width: '100%' }}
            id="sphere"
            d={path({ type: 'Sphere' })}
          />
          <GraticulePath id="graticule" d={path(geoGraticule()())} />
          <LinePath
            d={path({
              type: 'LineString',
              coordinates: planeCoordinates.plane
            })}
          />
        </svg>
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  height: 100%;
  width: 100%;
  padding: 1em;
  align-items: center;
  justify-content: center;
  /*background: black;*/
`;
const GraticulePath = styled.path`
  height: 100%;
  width: 100%;
  fill: none;
  stroke: ${props => props.theme.fgColorD60};
  stroke-width: 0.5px;
`;
const SpherePath = styled.path`
  height: 100%;
  width: 100%;
  fill: none;
  stroke: ${props => props.theme.fgColorD20};
  stroke-width: 1px;
`;

const LinePath = SpherePath.extend``;

/*
const PointPath = SpherePath.extend`
  fill: ${props => props.theme.fgColorD20};
`;
*/

export default SchmidtNet;
