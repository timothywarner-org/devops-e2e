const healthController = require('../../../src/controllers/healthController');

describe('HealthController', () => {
  let req; let
    res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    healthController.setReadiness(true);
    healthController.setLiveness(true);
  });

  describe('health', () => {
    it('should return healthy status when all checks pass', () => {
      healthController.health(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'healthy',
        version: expect.any(String),
        timestamp: expect.any(String),
        checks: expect.objectContaining({
          readiness: true,
          liveness: true,
          memory: expect.any(Object),
          uptime: expect.any(Number)
        })
      }));
    });

    it('should return unhealthy status when readiness fails', () => {
      healthController.setReadiness(false);
      healthController.health(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'unhealthy',
        checks: expect.objectContaining({
          readiness: false,
          liveness: true
        })
      }));
    });

    it('should return unhealthy status when liveness fails', () => {
      healthController.setLiveness(false);
      healthController.health(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'unhealthy',
        checks: expect.objectContaining({
          readiness: true,
          liveness: false
        })
      }));
    });

    it('should include memory check information', () => {
      healthController.health(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.checks.memory).toHaveProperty('heapUsedPercentage');
      expect(response.checks.memory).toHaveProperty('status');
      expect(['healthy', 'warning']).toContain(response.checks.memory.status);
    });
  });

  describe('readiness', () => {
    it('should return ready status when ready', () => {
      healthController.readiness(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'ready',
        timestamp: expect.any(String)
      }));
    });

    it('should return not ready status when not ready', () => {
      healthController.setReadiness(false);
      healthController.readiness(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'not ready',
        timestamp: expect.any(String)
      }));
    });
  });

  describe('liveness', () => {
    it('should return alive status when alive', () => {
      healthController.liveness(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'alive',
        timestamp: expect.any(String)
      }));
    });

    it('should return not alive status when not alive', () => {
      healthController.setLiveness(false);
      healthController.liveness(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'not alive',
        timestamp: expect.any(String)
      }));
    });
  });

  describe('setters', () => {
    it('should update readiness state', () => {
      healthController.setReadiness(false);
      healthController.readiness(req, res);
      expect(res.status).toHaveBeenCalledWith(503);

      healthController.setReadiness(true);
      healthController.readiness(req, res);
      expect(res.status).toHaveBeenLastCalledWith(200);
    });

    it('should update liveness state', () => {
      healthController.setLiveness(false);
      healthController.liveness(req, res);
      expect(res.status).toHaveBeenCalledWith(503);

      healthController.setLiveness(true);
      healthController.liveness(req, res);
      expect(res.status).toHaveBeenLastCalledWith(200);
    });
  });
});
