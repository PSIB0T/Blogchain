const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const Fuse = require('fuse.js');

const styles = {
  searchBoxStyle: {
    border: '1px solid #eee',
    borderRadius: 2,
    padding: '8px 10px',
    lineHeight: '24px',
    width: '100%',
    outline: 'none',
    fontSize: 16,
    color: '#666',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  searchBoxWrapper: {
    padding: '4px',
    boxShadow: '0 4px 15px 4px rgba(0,0,0,0.2)',
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  resultsStyle: {
    backgroundColor: '#fff',
    position: 'relative',
    padding: '12px',
    borderTop: '1px solid #eee',
    color: '#666',
    fontSize: 14,
    cursor: 'pointer',
  },
  selectedResultStyle: {
    backgroundColor: '#f9f9f9',
    position: 'relative',
    padding: '12px',
    borderTop: '1px solid #eee',
    color: '#666',
    fontSize: 14,
    cursor: 'pointer',
  },
  resultsWrapperStyle: {
    width: '40%',
    boxShadow: '0px 12px 30px 2px rgba(0, 0, 0, 0.1)',
    border: '1px solid #eee',
    borderTop: 0,
    boxSizing: 'border-box',
    maxHeight: 400,
    overflow: 'auto',
    position: 'absolute',
  },
};

function defaultResultsTemplate(props, state, styl, clickHandler) {
  return state.results.map((val, i) => {
    const style = state.selectedIndex === i ? styl.selectedResultStyle : styl.resultsStyle;
    return (
      <div key={i} style={style} onClick={() => clickHandler(i)}>
        {val.title}
      </div>
    );
  });
}

class FuzzySearch extends React.Component {
  constructor(props) {
    super(props);
    this.defaultProps = {
        caseSensitive: false,
        distance: 100,
        include: [],
        location: 0,
        width: 430,
        placeholder: 'Search',
        resultsTemplate: defaultResultsTemplate,
        shouldSort: true,
        sortFn(a, b) {
          return a.score - b.score;
        },
        threshold: 0.35,
        tokenize: false,
        verbose: false,
        autoFocus: false,
        maxResults: 10,
    };
    this.props = Object.assign(this.defaultProps, props)
    this.state = {
      results: [],
      selectedIndex: 0,
      selectedValue: {},
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
    console.log(props.list)
    this.fuse = new Fuse(props.list, this.getOptions());
    this.fuse2 = new Fuse(props.list2, this.getOptions())
    console.log(this.fuse.search("great"))
  }

  getOptions() {
    const {
      caseSensitive,
      id,
      include,
      keys,
      shouldSort,
      sortFn,
      tokenize,
      verbose,
      maxPatternLength,
      distance,
      threshold,
      location,
      options,
    } = this.props;

    return {
      caseSensitive,
      id,
      include,
      keys,
      shouldSort,
      sortFn,
      tokenize,
      verbose,
      maxPatternLength,
      distance,
      threshold,
      location,
      ...options,
    };
  }

  getResultsTemplate() {
    return this.state.results.map((val, i) => {
      const style = this.state.selectedIndex === i
        ? styles.selectedResultStyle
        : styles.resultsStyle;
      return <div key={i} style={style}>{val.title}</div>;
    });
  }

  componentDidUpdate(prevProps, prevState) {
    this.fuse = new Fuse(this.props.list, this.getOptions())
    this.fuse2 = new Fuse(this.props.list2, this.getOptions())
  }

  handleChange(e) {
    if(e.target.value[0] === "#") {
        this.setState({
            results: this.fuse2.search(e.target.value.substr(1)).slice(0, 5),
        });
    } else {
        this.setState({
            results: this.fuse.search(e.target.value).slice(0, 5),
        });
    }

  }

  handleKeyDown(e) {
    const { results, selectedIndex } = this.state;
    if (e.keyCode === 40 && selectedIndex < results.length - 1) {
      this.setState({
        selectedIndex: selectedIndex + 1,
      });
    } else if (e.keyCode === 38 && selectedIndex > 0) {
      this.setState({
        selectedIndex: selectedIndex - 1,
      });
    } else if (e.keyCode === 13) {
      if (results[selectedIndex]) {
        this.props.onSelect(results[this.state.selectedIndex]);
        this.setState({
          selectedValue: results[this.state.selectedIndex],
        });
      }
      this.setState({
        results: [],
        selectedIndex: 0,
      });
    }
  }

  search(e) {
    if (e.keyCode === 13) {
      this.props.onSelect(e.target.value);
    }
  }

  handleMouseClick(clickedIndex) {
    const { results } = this.state;

    if (results[clickedIndex]) {
      this.props.onSelect(results[clickedIndex]);
    }
    this.setState({
      results: [],
      selectedIndex: 0,
    });
  }

  render() {
    const { className, width, resultsTemplate, placeholder, autoFocus } = this.defaultProps;
    const mainClass = classNames('react-fuzzy-search', className);

    return (
      <div className={mainClass} style={{ width, zIndex: 2}} onKeyDown={this.handleKeyDown}>
        <div style={styles.searchBoxWrapper}>
          <input
            type="text"
            style={styles.searchBoxStyle}
            onChange={this.handleChange}
            placeholder={placeholder}
            autoFocus={autoFocus}
            onKeyUp={this.search.bind(this)}
            value={this.state.selectedValue && this.state.selectedValue.title}
          />
        </div>
        {this.state.results &&
          this.state.results.length > 0 &&
          <div style={styles.resultsWrapperStyle}>
            {resultsTemplate(this.props, this.state, styles, this.handleMouseClick)}
          </div>}
      </div>
    );
  }
}

module.exports = FuzzySearch