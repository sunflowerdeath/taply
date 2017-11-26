import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Tappable from '../index'

const getButtonStyle = ({ tapState, isDisabled }) => {
	const style = {
		padding: '10px 15px',
		display: 'inline-block',
		cursor: 'default',
		background: '#eee',
		outline: 'none',
		userSelect: 'none'
	}

	if (isDisabled) style.color = '#999'

	const { isHovered, isPressed, isFocused } = tapState
	if (isPressed) {
		style.background = '#333'
		style.color = 'white'
	} else if (isHovered) {
		style.background = '#ccc'
	}

	if (isFocused) {
		style.boxShadow = '0 0 0 2px #0088ff'
	}

	return style
}

const InlineButton = ({ isDisabled, onTap, children, isFocusable }) => (
	<Tappable onTap={onTap} isDisabled={isDisabled} isFocusable={isFocusable}>
		{tapState => (
			<div style={getButtonStyle({ isDisabled, tapState })}>{children}</div>
		)}
	</Tappable>
)

const Link = ({ isDisabled, children, isFocusable }) => (
	<Tappable onTap={onTap} isDisabled={isDisabled} isFocusable={isFocusable}>
		{({ isPressed, isHovered, isFocused }) => (
			<a
				href="https://google.com"
				style={{
					color: do {
						if (isDisabled) '#999'
						else if (isPressed) 'red'
						else if (isHovered) 'blue'
						else 'black'
					},
					outline: 'none',
					boxShadow: isFocused ? '0 0 0 2px #0088ff' : 'none'
				}}
			>
				{children}
			</a>
		)}
	</Tappable>
)

class StateButton extends Component {
	state = { tapState: {} }

	render() {
		const { isDisabled, onTap, children, isFocusable } = this.props

		return (
			<Tappable
				onTap={onTap}
				onChangeTapState={tapState => this.setState({ tapState })}
				isDisabled={isDisabled}
				isFocusable={isFocusable}
			>
				{tapState => (
					<div style={getButtonStyle({ isDisabled, tapState })}>{children}</div>
				)}
			</Tappable>
		)
	}
}

const onTap = () => console.log('onTap')

const Example = () => (
	<div>
		<InlineButton onTap={onTap}>Inline button</InlineButton>{' '}
		<InlineButton onTap={onTap} isFocusable={false}>
			Not focusable
		</InlineButton>{' '}
		<InlineButton onTap={onTap} isDisabled>
			Disabled
		</InlineButton>
		<br />
		<br />
		<StateButton onTap={onTap}>State button</StateButton>{' '}
		<StateButton onTap={onTap} isFocusable={false}>
			Not focusable
		</StateButton>{' '}
		<StateButton onTap={onTap} isDisabled>
			Disabled
		</StateButton>
		<br />
		<br />
		<Link>Link</Link> <Link isFocusable={false}>Not focusable</Link>
	</div>
)

ReactDOM.render(<Example />, document.querySelector('.container'))

// call event handlers on mouse interactions
// call event handlers on touch interactions
// call event handlers on keyboard interactions
// focus element on focus call
// not call event handlers when disabled
