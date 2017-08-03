import React from 'react';
import {shallow, mount} from 'enzyme';
import toJson from 'enzyme-to-json';

import {Client} from 'app/api';
import OnboardingWizard from 'app/views/onboarding/';
import Project from 'app/views/onboarding/project';

describe('OnboardingWizard', function() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    this.stubbedApiRequest = this.sandbox.stub(Client.prototype, 'request');
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  describe('render()', function() {
    const baseProps = {
      location: {query: {}},
      params: {
        projectId: '',
        orgId: 'testOrg'
      }
    };

    it('should render NotFound if no matching organization', function() {
      let props = {
        ...baseProps,
        params: {
          orgId: 'my-cool-org'
        }
      };

      let wrapper = shallow(<OnboardingWizard {...props} />, {
        organization: {id: '1337', slug: 'testOrg'}
      });
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should fill in project name if its empty when platform is chosen', function() {
      let props = {
        ...baseProps,
        children: (
          <Project
            next={jest.fn()}
            platform={''}
            setName={jest.fn()}
            name={''}
            setPlatform={jest.fn()}
          />
        )
      };

      let wrapper = mount(<OnboardingWizard {...props} />, {
        context: {
          organization: {id: '1337', slug: 'testOrg'},
          router: TestStubs.router()
        },
        childContextTypes: {
          router: React.PropTypes.object,
          organization: React.PropTypes.object
        }
      });

      let node = wrapper.find('PlatformCard').first();
      node.props().onClick();
      node.simulate('click');
      expect(wrapper.state().projectName).toBe('C#');

      node = wrapper.find('PlatformCard').last();
      node.props().onClick();
      node.simulate('click');
      expect(wrapper.state().projectName).toBe('Rails');

      wrapper.setState({projectName: 'another'});
      //but not replace it when project name is something else:
      node = wrapper.find('PlatformCard').first();
      node.props().onClick();
      node.simulate('click');
      expect(wrapper.state().projectName).toBe('another');

      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });
});
