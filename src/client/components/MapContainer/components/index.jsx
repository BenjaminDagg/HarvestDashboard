import React from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';

import Map from '../../Map/components';

class MapContainer extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			maps: null
		};
		
		this.getMaps = this.getMaps.bind(this);
	};
	
	componentDidMount() {
		this.getMaps();
	};
	
	getMaps() {
		var headers = {
            'Content-Type': 'application/json'
        };
		
		//make HTTP request to account service API
		axios.get('http://localhost:1234/maps',
			headers
		).then(res => {
			console.log(res);
			const mapData = res.data;
			
			this.setState({maps: mapData});
			console.log(mapData);
		})
		.catch(error => {
			this.props.submit(false);
			console.log('error');
		});	
	};

	render() {
		
		
		
		return (
		
			
			<div>
				{this.state.maps != null && 
					this.state.maps.map((data) => {
						return (
							
							<Map title={data.name} center={data.shape.coordinates[0]}/>
						)
					})
				}
			</div>
			
		);
	}
}

export default withRouter(MapContainer);
