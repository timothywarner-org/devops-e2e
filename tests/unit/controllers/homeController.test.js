const homeController = require('../../../src/controllers/homeController');

describe('HomeController', () => {
  let req; let
    res;

  beforeEach(() => {
    req = {};
    res = {
      render: jest.fn()
    };
  });

  describe('index', () => {
    it('should render index page with correct data', () => {
      homeController.index(req, res);

      expect(res.render).toHaveBeenCalledWith('index', expect.objectContaining({
        title: 'DevOps E2E Demo',
        version: expect.any(String),
        features: expect.arrayContaining([
          expect.stringContaining('Containerized')
        ])
      }));
    });

    it('should include all required features', () => {
      homeController.index(req, res);

      const renderCall = res.render.mock.calls[0][1];
      expect(renderCall.features).toHaveLength(6);
      expect(renderCall.features).toContain('Containerized Node.js Application');
      expect(renderCall.features).toContain('CI/CD with GitHub Actions');
    });
  });

  describe('about', () => {
    it('should render about page with technology stack', () => {
      homeController.about(req, res);

      expect(res.render).toHaveBeenCalledWith('about', expect.objectContaining({
        title: 'About DevOps E2E',
        description: expect.any(String),
        technologies: expect.objectContaining({
          backend: expect.any(Array),
          testing: expect.any(Array),
          containerization: expect.any(Array),
          ci_cd: expect.any(Array),
          cloud: expect.any(Array),
          monitoring: expect.any(Array)
        })
      }));
    });

    it('should include correct technology categories', () => {
      homeController.about(req, res);

      const renderCall = res.render.mock.calls[0][1];
      const techCategories = Object.keys(renderCall.technologies);

      expect(techCategories).toContain('backend');
      expect(techCategories).toContain('testing');
      expect(techCategories).toContain('containerization');
      expect(techCategories).toContain('ci_cd');
      expect(techCategories).toContain('cloud');
      expect(techCategories).toContain('monitoring');
    });
  });

  describe('contact', () => {
    it('should render contact page with resources', () => {
      homeController.contact(req, res);

      expect(res.render).toHaveBeenCalledWith('contact', expect.objectContaining({
        title: 'Contact & Resources',
        resources: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            url: expect.any(String)
          })
        ])
      }));
    });

    it('should include all required resources', () => {
      homeController.contact(req, res);

      const renderCall = res.render.mock.calls[0][1];
      const resourceNames = renderCall.resources.map((r) => r.name);

      expect(resourceNames).toContain('GitHub Repository');
      expect(resourceNames).toContain('Documentation');
      expect(resourceNames).toContain('API Reference');
      expect(resourceNames).toContain('Azure Portal');
    });
  });
});
